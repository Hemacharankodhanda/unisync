// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-analytics.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    onAuthStateChanged, 
    signOut,
    updateProfile 
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    getDocs, 
    query, 
    where, 
    orderBy,
    onSnapshot,
    doc,
    updateDoc,
    deleteDoc,
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";
import { 
    getStorage, 
    ref, 
    uploadBytes, 
    getDownloadURL 
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-storage.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDJchdKXOc38XYYxzy1hzDH_8ATyhNCfWw",
    authDomain: "unisync-1dd43.firebaseapp.com",
    projectId: "unisync-1dd43",
    storageBucket: "unisync-1dd43.firebasestorage.app",
    messagingSenderId: "109097243889",
    appId: "1:109097243889:web:1668f91c4a0a415fa00550",
    measurementId: "G-KTFYF8YF97"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Firestore collections
const firestoreCollections = {
    users: 'users',
    lostItems: 'lostItems',
    foundItems: 'foundItems',
    foodItems: 'foodItems',
    studyGroups: 'studyGroups',
    messages: 'messages',
    notifications: 'notifications'
};

// Firestore functions
const firestoreFunctions = {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    orderBy,
    onSnapshot,
    doc,
    updateDoc,
    deleteDoc,
    serverTimestamp
};

// Storage functions
const storageFunctions = {
    ref,
    uploadBytes,
    getDownloadURL
};

// Collection Operations
const collectionOperations = {
    // User Operations
    async createUserProfile(userId, userData) {
        try {
            const userProfile = {
                ...userData,
                userId: userId,
                createdAt: serverTimestamp(),
                lastLogin: serverTimestamp()
            };
            
            await addDoc(collection(db, 'users'), userProfile);
            console.log('User profile created successfully');
            return true;
        } catch (error) {
            console.error('Error creating user profile:', error);
            return false;
        }
    },

    // Lost Items Operations
    async addLostItem(itemData) {
        try {
            const lostItem = {
                ...itemData,
                userId: window.currentUser?.uid || 'demo-user',
                status: 'lost',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };
            
            const docRef = await addDoc(collection(db, 'lostItems'), lostItem);
            console.log('Lost item added with ID:', docRef.id);
            return docRef.id;
        } catch (error) {
            console.error('Error adding lost item:', error);
            throw error;
        }
    },

    // Found Items Operations
    async addFoundItem(itemData, imageFile = null) {
        try {
            let imageUrl = '';
            
            if (imageFile) {
                imageUrl = await this.uploadImage(imageFile, 'found-items');
            }
            
            const foundItem = {
                ...itemData,
                userId: window.currentUser?.uid || 'demo-user',
                status: 'found',
                imageUrl: imageUrl,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };
            
            const docRef = await addDoc(collection(db, 'foundItems'), foundItem);
            console.log('Found item added with ID:', docRef.id);
            return docRef.id;
        } catch (error) {
            console.error('Error adding found item:', error);
            throw error;
        }
    },

    // Food Items Operations
    async addFoodItem(itemData) {
        try {
            const foodItem = {
                ...itemData,
                userId: window.currentUser?.uid || 'demo-user',
                lastUpdated: serverTimestamp()
            };
            
            const docRef = await addDoc(collection(db, 'foodItems'), foodItem);
            console.log('Food item added with ID:', docRef.id);
            return docRef.id;
        } catch (error) {
            console.error('Error adding food item:', error);
            throw error;
        }
    },

    // Study Groups Operations
    async createStudyGroup(groupData) {
        try {
            const studyGroup = {
                ...groupData,
                createdBy: window.currentUser?.uid || 'demo-user',
                members: [window.currentUser?.uid || 'demo-user'],
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };
            
            const docRef = await addDoc(collection(db, 'studyGroups'), studyGroup);
            console.log('Study group created with ID:', docRef.id);
            return docRef.id;
        } catch (error) {
            console.error('Error creating study group:', error);
            throw error;
        }
    },

    // Image Upload
    async uploadImage(file, folder) {
        try {
            const storageRef = ref(storage, `${folder}/${Date.now()}_${file.name}`);
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);
            return downloadURL;
        } catch (error) {
            console.error('Error uploading image:', error);
            throw error;
        }
    },

    // Get items by user
    async getUserItems(userId, collectionName) {
        try {
            const q = query(
                collection(db, collectionName),
                where('userId', '==', userId),
                orderBy('createdAt', 'desc')
            );
            
            const querySnapshot = await getDocs(q);
            const items = [];
            querySnapshot.forEach((doc) => {
                items.push({ id: doc.id, ...doc.data() });
            });
            return items;
        } catch (error) {
            console.error('Error getting user items:', error);
            return [];
        }
    }
};

// Make everything available globally
window.auth = auth;
window.db = db;
window.storage = storage;
window.firestoreCollections = firestoreCollections;
window.firestoreFunctions = firestoreFunctions;
window.storageFunctions = storageFunctions;
window.collectionOperations = collectionOperations;
window.createUserWithEmailAndPassword = createUserWithEmailAndPassword;
window.signInWithEmailAndPassword = signInWithEmailAndPassword;
window.onAuthStateChanged = onAuthStateChanged;
window.signOut = signOut;
window.updateProfile = updateProfile;

console.log('Firebase initialized successfully with collection operations!');