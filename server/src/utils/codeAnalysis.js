/**
 * Analyze code for malicious patterns before execution
 */
export const analyzeCode = (code, language) => {
  const issues = [];
  const codeStr = code.toString().toLowerCase();
  
  // Python-specific dangerous patterns
  if (language === 'python') {
    const pythonDangerousPatterns = [
      { pattern: /import\s+os/i, message: 'Import of "os" module is not allowed', severity: 'high' },
      { pattern: /import\s+subprocess/i, message: 'Import of "subprocess" module is not allowed', severity: 'high' },
      { pattern: /import\s+sys/i, message: 'Import of "sys" module is not allowed', severity: 'high' },
      { pattern: /import\s+socket/i, message: 'Import of "socket" module is not allowed', severity: 'high' },
      { pattern: /import\s+requests/i, message: 'Import of "requests" module is not allowed', severity: 'high' },
      { pattern: /import\s+urllib/i, message: 'Import of "urllib" module is not allowed', severity: 'high' },
      { pattern: /from\s+os\s+import/i, message: 'Import from "os" module is not allowed', severity: 'high' },
      { pattern: /from\s+subprocess\s+import/i, message: 'Import from "subprocess" module is not allowed', severity: 'high' },
      { pattern: /\beval\s*\(/i, message: 'Use of "eval()" is not allowed', severity: 'high' },
      { pattern: /\bexec\s*\(/i, message: 'Use of "exec()" is not allowed', severity: 'high' },
      { pattern: /\b__import__\s*\(/i, message: 'Use of "__import__()" is not allowed', severity: 'high' },
      { pattern: /\bcompile\s*\(/i, message: 'Use of "compile()" is not allowed', severity: 'high' },
      { pattern: /\bopen\s*\(/i, message: 'File operations are not allowed', severity: 'medium' },
      { pattern: /\.fork\s*\(/i, message: 'Fork operations are not allowed', severity: 'high' },
      { pattern: /while\s+true\s*:/i, message: 'Potential infinite loop detected', severity: 'medium' },
      { pattern: /while\s+1\s*:/i, message: 'Potential infinite loop detected', severity: 'medium' },
    ];
    
    pythonDangerousPatterns.forEach(({ pattern, message, severity }) => {
      if (pattern.test(code)) {
        issues.push({ pattern: pattern.source, message, severity });
      }
    });
  }
  
  // JavaScript-specific dangerous patterns
  if (language === 'javascript') {
    const jsDangerousPatterns = [
      { pattern: /require\s*\(\s*['"]fs['"]\s*\)/i, message: 'Import of "fs" module is not allowed', severity: 'high' },
      { pattern: /require\s*\(\s*['"]child_process['"]\s*\)/i, message: 'Import of "child_process" module is not allowed', severity: 'high' },
      { pattern: /require\s*\(\s*['"]net['"]\s*\)/i, message: 'Import of "net" module is not allowed', severity: 'high' },
      { pattern: /require\s*\(\s*['"]http['"]\s*\)/i, message: 'Import of "http" module is not allowed', severity: 'high' },
      { pattern: /require\s*\(\s*['"]https['"]\s*\)/i, message: 'Import of "https" module is not allowed', severity: 'high' },
      { pattern: /\beval\s*\(/i, message: 'Use of "eval()" is not allowed', severity: 'high' },
      { pattern: /new\s+Function\s*\(/i, message: 'Use of "Function()" constructor is not allowed', severity: 'high' },
      { pattern: /while\s*\(\s*true\s*\)/i, message: 'Potential infinite loop detected', severity: 'medium' },
      { pattern: /while\s*\(\s*1\s*\)/i, message: 'Potential infinite loop detected', severity: 'medium' },
      { pattern: /for\s*\(\s*;\s*;\s*\)/i, message: 'Potential infinite loop detected', severity: 'medium' },
    ];
    
    jsDangerousPatterns.forEach(({ pattern, message, severity }) => {
      if (pattern.test(code)) {
        issues.push({ pattern: pattern.source, message, severity });
      }
    });
  }
  
  // Check for excessive string allocation (potential memory bomb)
  const stringMultiplicationPattern = /(['"]).*?\1\s*\*\s*\d{6,}/;
  if (stringMultiplicationPattern.test(code)) {
    issues.push({
      pattern: 'string_multiplication',
      message: 'Excessive string multiplication detected (potential memory bomb)',
      severity: 'high'
    });
  }
  
  // Check code length
  if (code.length > 50000) {
    issues.push({
      pattern: 'code_length',
      message: 'Code is too long (max 50,000 characters)',
      severity: 'medium'
    });
  }
  
  return {
    isSafe: issues.filter(i => i.severity === 'high').length === 0,
    issues,
    hasHighSeverity: issues.some(i => i.severity === 'high'),
    hasMediumSeverity: issues.some(i => i.severity === 'medium')
  };
};

/**
 * Sanitize code output to prevent information disclosure
 */
export const sanitizeOutput = (output) => {
  if (!output || typeof output !== 'string') return output;
  
  // Remove potential file paths
  let sanitized = output.replace(/\/[a-z0-9_\-/.]+/gi, '[path]');
  
  // Remove Docker container IDs
  sanitized = sanitized.replace(/[a-f0-9]{64}/gi, '[container-id]');
  
  // Remove potential internal IPs
  sanitized = sanitized.replace(/\b(?:10|172|192)\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, '[internal-ip]');
  
  return sanitized;
};

/**
 * Estimate code complexity to adjust timeout
 */
export const estimateComplexity = (code) => {
  const loopCount = (code.match(/\b(for|while)\b/gi) || []).length;
  const recursionCount = (code.match(/\bdef\s+\w+.*:\s*\w+\(/gi) || []).length;
  const nestedLevel = Math.max(
    (code.match(/\{/g) || []).length,
    (code.match(/:/g) || []).length / 2
  );
  
  return {
    loopCount,
    recursionCount,
    nestedLevel,
    complexity: loopCount * 2 + recursionCount * 3 + nestedLevel
  };
};
