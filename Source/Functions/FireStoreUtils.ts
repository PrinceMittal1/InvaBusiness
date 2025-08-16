import firestore, { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";
import FireKeys from "./FireKeys";
import moment from "moment";
import { Platform } from "react-native";
import storage from '@react-native-firebase/storage';
import RNFS from 'react-native-fs';

export default function useFireStoreUtil() {

    const creatingCustomerUserId = async (phoneNumber: string, email: string) => {
        try {
            const phoneQuery = await firestore()
                .collection(FireKeys.BusinessUser)
                .where('phoneNumber', '==', phoneNumber)
                .get();
            if (!phoneQuery.empty) {
                return phoneQuery.docs[0].id;
            }
            const emailQuery = await firestore()
                .collection(FireKeys.BusinessUser)
                .where('email', '==', email)
                .get();

            if (!emailQuery.empty) {
                return emailQuery.docs[0].id;
            }
            return null;
        } catch (error) {
            console.error('Error searching for user:', error);
            throw error;
        }
    };


    const creatingCustomerUser = async (profile_picture: string, name: string, email: string): Promise<string> => {
        try {
            const roomId = await creatingCustomerUserId("", email);
            let roomRef;
            let docId: string;
            if (roomId) {
                roomRef = firestore().collection(FireKeys.BusinessUser).doc(roomId);
                const roomSnap = await roomRef.get();
                docId = roomSnap.id;
            } else {
                const newDocRef = await firestore().collection(FireKeys.BusinessUser).add({
                    createdAt: moment().unix(),
                    name: name,
                    profile_picture: profile_picture,
                    email: email
                });
                await newDocRef.update({
                    user_id: newDocRef.id
                });
                console.log("user id for login is 3 (new doc)", newDocRef.id);
                docId = newDocRef.id;
            }
            return docId;
        } catch (error) {
            console.error("🔥 Error in creatingCustomerUser:", error);
            throw error;
        }
    };

    const customerRoomRef = async (user_id: string) => {
        let roomRef = firestore().collection(FireKeys.BusinessUser).doc(user_id);

        return roomRef
    }

    const getCustomerUserRefById = async (user_id: string) => {
        const querySnapshot = await firestore()
            .collection(FireKeys.BusinessUser)
            .where("user_id", "==", user_id)
            .get();
        if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0]; // First matching do
            const roomRef = firestore().collection(FireKeys.BusinessUser).doc(doc.id);
            return roomRef;
        } else {
            throw new Error(`❌ No user found with email: ${user_id}`);
        }
    };


    const updatingCustomerUserDetail = async (
        user_id: string,
        businessName: string,
        businessType: string,
        productsType: any,
        stateCode: string,
        state: string,
        city: string
    ) => {
        try {
            const roomRef = await getCustomerUserRefById(user_id);
            await roomRef.update({
                businessName: businessName,
                businessType: businessType,
                productsType: productsType,
                stateCode: stateCode,
                state: state,
                city: city,
            });
            return roomRef
        } catch (error) {
            console.error("❌ Error updating user document:", error);
            throw error;
        }
    };


    const createProduct = async (
        user_id: string,
        images: any,
        title: string,
        productType: any,
        selectedTags: any
    ) => {
        try {
            const newProduct = {
                user_id,
                images,
                title,
                productType,
                selectedTags,
                createdAt: moment().unix(),
            };

            const docRef = await firestore().collection('Products').add(newProduct);
            console.log("✅ Product created with ID:", docRef.id);
            return docRef.id ?? null
        } catch (error) {
            console.error("❌ Error creating product:", error);
            throw error;
        }
    };


    const updateProduct = async (
        productId: string,
        user_id: string,
        images: any,
        title: string,
        productType: any,
        selectedTags: any
    ) => {
        try {
            const updatedProduct = {
                user_id,
                images,
                title,
                productType,
                selectedTags,
                updatedAt: moment().unix(),
            };

            await firestore().collection(FireKeys?.Products).doc(productId).update(updatedProduct);
            console.log("✅ Product updated with ID:", productId);
            return true;
        } catch (error) {
            console.error("❌ Error updating product:", error);
            throw error;
        }
    };


    const gettingAllChats = async (id: string) => {
        if (!id) return [];

        const snapshot = await firestore()
            .collection('Chats')
            .where('sellerId', '==', id)
            .get();

        const chats: any = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));


        const finalList = [];

        for (const chat of chats) {
            const sellerId = chat?.sellerId
            const customerId = chat?.customerId
            const sellerSnap = await firestore()
                .collection(FireKeys?.BusinessUser)
                .doc(sellerId)
                .get();
            const sellerData = sellerSnap.exists ? sellerSnap.data() : null;

            const customerSnap = await firestore()
                .collection(FireKeys?.CustomerUser)
                .doc(customerId)
                .get();
            const customerData = customerSnap.exists ? customerSnap.data() : null;

            finalList.push({
                chatId: chat.id,
                business_name: sellerData?.businessName,
                business_picture: sellerData?.profile_picture,
                customer_name: customerData?.name,
                customer_picture: customerData?.profile_picture,
                ...chat
            });
        }

        return finalList;
    };

    const createOrGetChatRoom = async (sellerId: string, customerId: string) => {
        const chatRoomId = sellerId + '_' + customerId;
        const chatRoomRef = firestore().collection('Chats').doc(chatRoomId);

        const chatDoc = await chatRoomRef.get();

        if (!chatDoc.exists) {
            await chatRoomRef.set({
                sellerId: sellerId,
                customerId: customerId,
                unseenMessages: 0,
                lastMessage: '',
                lastUpdated: firestore.FieldValue.serverTimestamp(),
            });
        }

        return chatRoomRef;
    };

    const fetchMessagesWithPagination = async (
        chatRoomRef: FirebaseFirestoreTypes.DocumentReference,
        pageSize: number,
        lastDoc: FirebaseFirestoreTypes.DocumentSnapshot | null = null
    ) => {
        let query = chatRoomRef
            .collection('messages')
            .orderBy('timestamp', 'desc')
            .limit(pageSize);

        if (lastDoc) {
            query = query.startAfter(lastDoc);
        }

        const snapshot = await query.get();
        const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const lastVisible = snapshot.docs[snapshot.docs.length - 1] || null;

        return {
            messages,
            lastDoc: lastVisible,
        };
    };

    const sendMessageToRoom = async (
        chatRoomRef: FirebaseFirestoreTypes.DocumentReference,
        senderId: string,
        text: string,
        imagesUrl?: any,
    ) => {
        var messageData
        if (imagesUrl.length > 0) {
            messageData = {
                senderId,
                imagesUrl,
                text,
                timestamp: firestore.FieldValue.serverTimestamp(),
            };
        } else {
            messageData = {
                senderId,
                text,
                timestamp: firestore.FieldValue.serverTimestamp(),
            };
        }

        await chatRoomRef.collection('messages').add(messageData);


        await chatRoomRef.update({
            lastMessage: text,
            lastUpdated: firestore.FieldValue.serverTimestamp(),
        });

        return true
    };

    const uploadMediaToFirebase = async (data: any) => {
        try {
            const uri = data;
            if (!uri) throw new Error("No file URI");
            const fileName = `file_${Date.now()}.jpg`;
            const pathToFile = Platform.OS === 'ios' ? uri.replace('file://', '') : uri.replace('file://', '');
            const fileExists = await RNFS.exists(pathToFile);
            if (!fileExists) {
                return;
            }
            const uploadRef = storage().ref(`uploads/${fileName}`);
            const task = uploadRef.putFile(pathToFile);

            await task;
            const downloadURL = await uploadRef.getDownloadURL();
            return downloadURL;
        } catch (err: any) {
            console.error('❌ Upload failed:', err.code, err.message);
        }
    };



    return {
        creatingCustomerUser,
        updatingCustomerUserDetail,
        uploadMediaToFirebase,
        createProduct,
        updateProduct,
        gettingAllChats,
        createOrGetChatRoom,
        fetchMessagesWithPagination,
        sendMessageToRoom
    };
}
