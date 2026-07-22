import React, { useEffect, useMemo, useState } from 'react';
import { auth } from '@/src/shared/config/firebase';
import { ProfileImage } from '@/src/shared/types/User';
import useDebounce from '@/src/shared/lib/hooks/useDebounce';
import isUsernameTaken from '../../data/legacy/isUsernameTaken';
import * as ImagePicker from 'expo-image-picker';
import { Alert, Image, Platform, Pressable, View } from 'react-native';
import { Text } from 'react-native-paper';
import { TextField } from '@/src/shared/ui/inputs/TextField';
import ProfileFormProps from '@/src/shared/types/props/ProfileFormProps';

import * as CONSTANTS from "@/src/shared/config/constants"


const ProfileForm: React.FC<ProfileFormProps> = ({ formUser, updateFormUser , usernameTaken, setUsernameTaken}) => {
  const [requestingPerms, setRequestingPerms] = useState(false)

  // Seed Google photoURL exactly once if user has none set yet
  useEffect(() => {
    const photoURL = auth.currentUser?.photoURL;
    const hasUserImage = !!formUser?.profile?.profileImage?.local_uri;

    if (!hasUserImage && photoURL) {
      updateFormUser("profile.profileImage", { type: "google", local_uri: photoURL } as ProfileImage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const debouncedUsername = useDebounce(formUser?.profile?.username, 500);

  useEffect(() => {
    async function checkIfTaken() {
      if (debouncedUsername) {
        const taken = await isUsernameTaken(debouncedUsername);
        if (setUsernameTaken){
          setUsernameTaken(taken);
        }
      }
    }

    checkIfTaken();
  }, [debouncedUsername]);



  // current image URL or fallback
  const currentImageSource = useMemo(() => {
    const url = formUser?.profile?.profileImage?.local_uri;
    if (url) return { uri: url };
    return CONSTANTS.DEFAULT_AVATAR;
  }, [formUser?.profile?.profileImage?.local_uri]);

  const bioLength = formUser?.profile?.bio?.length ?? 0;
  const remainingBio = Math.max(0, CONSTANTS.MAX_BIO_LENGTH - bioLength);

  const pickFromLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return;
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.9,
    });
    if (!res.canceled && res.assets?.[0]?.uri) {
      updateFormUser("profile.profileImage", { type: "stored", local_uri: res.assets[0].uri });
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") return;
    const res = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.9,
      cameraType: ImagePicker.CameraType.front, // selfie
    });
    if (!res.canceled && res.assets?.[0]?.uri) {
      updateFormUser("profile.profileImage", { type: "stored", local_uri: res.assets[0].uri });
    }
  };

// Call this from your avatar Pressable
  const changePhoto = () => {
    if (Platform.OS === "ios") {
      Alert.alert("Profile photo", "Choose a source", [
        { text: "Take Photo", onPress: takePhoto },
        { text: "Choose from Library", onPress: pickFromLibrary },
        { text: "Cancel", style: "cancel" },
      ]);
    } else {
      Alert.alert("Profile photo", "Choose a source", [
        { text: "Take Photo", onPress: takePhoto },
        { text: "Choose from Library", onPress: pickFromLibrary },
        { text: "Cancel", style: "cancel" },
      ]);
    }
  };



  return (
    <View className="w-full h-full">
      <Text variant="displaySmall" className="font-bold mb-6">
        Make your profile
      </Text>

      {/* Avatar + Edit */}
      <View className="items-center mb-8">
        <Pressable
          onPress={changePhoto}
          disabled={requestingPerms}
          className="relative"
          accessibilityRole="button"
          accessibilityLabel="Change profile photo"
        >
          <Image
            source={currentImageSource}
            className="w-28 h-28 rounded-full"
          />
          <View className="absolute bottom-0 right-0 px-2 py-1 rounded-full bg-black/60">
            <Text className="text-white text-xs">Edit</Text>
          </View>
        </Pressable>
        <Text className="text-gray-500 mt-2 text-xs">
          Tap to choose a photo
        </Text>
      </View>

      {/* Username */}
      <View className="mb-6">
        <Text className="mb-1 font-medium">Your Username</Text>
        <TextField
          placeholder="e.g., jayden"
          value={formUser?.profile?.username ?? ""}
          onChangeText={(input) => updateFormUser("profile.username", input)}
          autoCapitalize="none"
          autoCorrect={false}
          maxLength={CONSTANTS.MAX_USERNAME_LENGTH}
        />
        <Text className="text-gray-500 mt-1 text-xs">
          {`${(formUser?.profile?.username?.length ?? 0)}/${CONSTANTS.MAX_USERNAME_LENGTH}`}
        </Text>
      </View>

      {/* Bio */}
      <View className="mb-4">
        <Text className="mb-1 font-medium">Bio</Text>
        <TextField
          placeholder="Tell people a little about you..."
          value={formUser?.profile?.bio ?? ""}
          onChangeText={(input) => updateFormUser("profile.bio", input)}
          multiline
          maxLength={CONSTANTS.MAX_BIO_LENGTH}
          className={"max-h-32 py-2"}
        />
        <Text className={`mt-1 text-xs ${remainingBio <= 20 ? "text-red-500" : "text-gray-500"}`}>
          {remainingBio} characters left
        </Text>
      </View>
    </View>
  );
};


export default  ProfileForm