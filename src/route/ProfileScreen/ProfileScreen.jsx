import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    Image,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Edit, Settings } from 'lucide-react-native';

const UserProfileScreen = ({ navigation }) => {
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
            <ScrollView contentContainerStyle={styles.scrollContent}>
                
                <View style={styles.header}>
                    <Image
                        source={require('../../assets/images/profile.jpg')} 
                        style={styles.avatar}
                    />
                    <View style={styles.headerText}>
                        <Text style={styles.name}>Shahroz Butt Official</Text>
                        <Text style={styles.username}>@shahroz_butt</Text>
                        <Text style={styles.bio}>
                            Software Engineer 👨‍💻 | Tech Explorer | Sharing updates on{" "}
                            <Text style={styles.tag}>#Mobiles</Text>,{" "}
                            <Text style={styles.tag}>#AI</Text>, and{" "}
                            <Text style={styles.tag}>#SNGPL</Text> 🚀
                        </Text>
                    </View>
                </View>

               
                <View style={styles.actions}>
                    <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => navigation.navigate('EditProfileScreen')}
                    >
                        <Edit size={18} color="#fff" />
                        <Text style={styles.actionText}>Edit Profile</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionBtn, styles.secondaryBtn]}
                        onPress={() => navigation.navigate('SettingsScreen')}
                    >
                        <Settings size={18} color="#000" />
                        <Text style={[styles.actionText, styles.secondaryText]}>Settings</Text>
                    </TouchableOpacity>
                </View>


                <View style={styles.stats}>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>2,340</Text>
                        <Text style={styles.statLabel}>Followers</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>1,120</Text>
                        <Text style={styles.statLabel}>Following</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>580</Text>
                        <Text style={styles.statLabel}>Posts</Text>
                    </View>
                </View>

              
                <View style={styles.activitySection}>
                    <Text style={styles.sectionTitle}>Recent Activity</Text>
                    <View style={styles.postCard}>
                        <Text style={styles.postText}>
                            Just compared the latest Samsung and iPhone models. The game is heating
                            up! 🔥 <Text style={styles.tag}>#Mobiles</Text>
                        </Text>
                        <Text style={styles.postDate}>3h ago</Text>
                    </View>
                    <View style={styles.postCard}>
                        <Text style={styles.postText}>
                            Got notified from <Text style={styles.tag}>#SNGPL</Text> about service
                            updates. Really improving the system 👏
                        </Text>
                        <Text style={styles.postDate}>1d ago</Text>
                    </View>
                    <View style={styles.postCard}>
                        <Text style={styles.postText}>
                            Working on an exciting AI-based project. The future is here! 🚀{" "}
                            <Text style={styles.tag}>#AI</Text>
                        </Text>
                        <Text style={styles.postDate}>2d ago</Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollContent: {
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    avatar: {
        width: 90,
        height: 90,
        borderRadius: 45,
        marginRight: 15,
    },
    headerText: {
        flex: 1,
        justifyContent: 'center',
    },
    name: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#000',
    },
    username: {
        fontSize: 14,
        color: '#657786',
        marginBottom: 6,
    },
    bio: {
        fontSize: 14,
        color: '#000',
        lineHeight: 20,
    },
    tag: {
        color: '#000',
        fontWeight: 'bold',
    },
    actions: {
        flexDirection: 'row',
        marginBottom: 25,
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#000',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginRight: 10,
    },
    secondaryBtn: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#000',
    },
    actionText: {
        marginLeft: 6,
        fontSize: 14,
        color: '#fff',
        fontWeight: '600',
    },
    secondaryText: {
        color: '#000',
    },
    stats: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 30,
    },
    statItem: {
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
    },
    statLabel: {
        fontSize: 14,
        color: '#657786',
    },
    activitySection: {
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 12,
    },
    postCard: {
        backgroundColor: '#f9f9f9',
        padding: 15,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e6e6e6',
    },
    postText: {
        fontSize: 15,
        color: '#000',
        marginBottom: 6,
    },
    postDate: {
        fontSize: 12,
        color: '#657786',
    },
});

export default UserProfileScreen;
