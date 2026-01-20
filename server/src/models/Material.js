import { getFirestore, Timestamp } from '../config/firebase.js';

const COLLECTION_NAME = 'materials';

export class Material {
  static async create(materialData) {
    const db = getFirestore();
    const materialRef = db.collection(COLLECTION_NAME).doc();
    
    const material = {
      _id: materialRef.id,
      title: materialData.title,
      description: materialData.description,
      fileUrl: materialData.fileUrl,
      fileName: materialData.fileName,
      fileSize: materialData.fileSize,
      fileType: materialData.fileType,
      subjectId: materialData.subjectId,
      uploadedBy: materialData.uploadedBy,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    
    await materialRef.set(material);
    return { ...material, id: materialRef.id };
  }

  static async findById(id) {
    const db = getFirestore();
    const doc = await db.collection(COLLECTION_NAME).doc(id).get();
    
    if (!doc.exists) return null;
    
    return { id: doc.id, _id: doc.id, ...doc.data() };
  }

  static async find(query = {}) {
    const db = getFirestore();
    let queryRef = db.collection(COLLECTION_NAME);
    
    if (query.subjectId) {
      queryRef = queryRef.where('subjectId', '==', query.subjectId);
    }
    if (query.uploadedBy) {
      queryRef = queryRef.where('uploadedBy', '==', query.uploadedBy);
    }
    
    queryRef = queryRef.orderBy('createdAt', 'desc');
    
    const snapshot = await queryRef.get();
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      _id: doc.id,
      ...doc.data()
    }));
  }

  static async deleteById(id) {
    const db = getFirestore();
    await db.collection(COLLECTION_NAME).doc(id).delete();
    return { id, _id: id };
  }
}
