import Docker from 'dockerode';
import { analyzeCode, sanitizeOutput } from '../utils/codeAnalysis.js';

const timeoutMs = Number(process.env.CODE_EXECUTION_TIMEOUT || 5000); // Reduced from 10s to 5s

const LANGUAGE_IMAGES = {
  javascript: 'node:18-alpine',
  python: 'python:3.11-alpine',
};

const buildCommand = ({ language, code, stdin: _stdin }) => {
  // Minimal MVP: run code without persisting files.
  // SECURITY NOTE: Must run in locked-down container with no network and resource limits.
  if (language === 'javascript') {
    // node -e "..."
    return ['node', '-e', code];
  }
  if (language === 'python') {
    return ['python', '-c', code];
  }
  throw new Error('Unsupported language');
};

export const executeCodeDocker = async ({ language, code, stdin }) => {
  const image = LANGUAGE_IMAGES[language];
  if (!image) throw new Error('Unsupported language');

  // Analyze code for malicious patterns before execution
  const analysis = analyzeCode(code, language);
  if (!analysis.isSafe) {
    const highSeverityIssues = analysis.issues.filter(i => i.severity === 'high');
    if (highSeverityIssues.length > 0) {
      return {
        stdout: '',
        stderr: `Code execution blocked due to security concerns:\n${highSeverityIssues.map(i => `- ${i.message}`).join('\n')}`,
        exitCode: 1,
        blocked: true
      };
    }
  }

  const docker = new Docker();

  const Cmd = buildCommand({ language, code, stdin });

  // Create container with stricter limits
  const container = await docker.createContainer({
    Image: image,
    Cmd,
    AttachStdout: true,
    AttachStderr: true,
    AttachStdin: Boolean(stdin),
    OpenStdin: Boolean(stdin),
    StdinOnce: Boolean(stdin),
    NetworkDisabled: true,
    HostConfig: {
      AutoRemove: true,
      Memory: Number(process.env.CODE_EXECUTION_MEMORY_LIMIT || 128) * 1024 * 1024, // Reduced from 256MB to 128MB
      MemorySwap: Number(process.env.CODE_EXECUTION_MEMORY_LIMIT || 128) * 1024 * 1024, // Disable swap
      NanoCpus: 500_000_000, // 0.5 CPU
      PidsLimit: 32, // Reduced from 64 to 32
      ReadonlyRootfs: true,
      CapDrop: ['ALL'],
      SecurityOpt: ['no-new-privileges:true'],
    },
  });

  const stream = await container.attach({ stream: true, stdout: true, stderr: true, stdin: Boolean(stdin) });

  let stdout = '';
  let stderr = '';

  stream.on('data', (chunk) => {
    // docker multiplexed stream; for MVP treat as combined
    stdout += chunk.toString('utf8');
  });

  if (stdin) {
    stream.write(stdin);
    stream.end();
  }

  await container.start();

  const waitPromise = container.wait();
  const timed = await Promise.race([
    waitPromise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Time limit exceeded')), timeoutMs)),
  ]);

  // `timed` contains StatusCode
  const exitCode = timed?.StatusCode ?? 0;

  // Sanitize output to prevent information disclosure
  const sanitizedStdout = sanitizeOutput(stdout.trimEnd());
  const sanitizedStderr = sanitizeOutput(stderr.trimEnd());

  // Best-effort: stderr not separated in MVP.
  return { stdout: sanitizedStdout, stderr: sanitizedStderr, exitCode };
};

export const executeCode = async ({ language, code, stdin }) => {
  // In production we should require docker and pre-pulled minimal sandbox images.
  try {
    return await executeCodeDocker({ language, code, stdin });
  } catch (e) {
    // If Docker isn't available in current environment, return a clear message.
    const msg = String(e?.message || e);
    if (msg.includes('connect') || msg.includes('ENOENT')) {
      return {
        stdout: '',
        stderr:
          'Code execution service is not available (Docker daemon not reachable). Configure Docker to enable live execution.',
        exitCode: 127,
      };
    }
    throw e;
  }
};
