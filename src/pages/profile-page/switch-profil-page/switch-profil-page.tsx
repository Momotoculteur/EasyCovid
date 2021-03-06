import { Ionicons } from "@expo/vector-icons";
import * as React from "react";
import { Alert, Platform, ScrollView, Text, TouchableOpacity, TouchableWithoutFeedback, View, VirtualizedList } from "react-native";
import { RadioButton, Snackbar } from 'react-native-paper';
import DatabaseManager from "../../../database/DatabaseManager";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCurrentUser } from "../../../services/storage/userAsyncStorage";
import { IUserObject } from "../../../components/shared/interface/object/IUserObject";


interface iState {
    listAllUsers: IUserObject[],
    idCurrentUser: string,
    popupActive: boolean,
    popupMessage: string
}
interface IProps {
}
export default class SwitchProfilePage extends React.Component<IProps, iState> {

    constructor(props: IProps) {
        super(props);
        this.state = {
            listAllUsers: [],
            idCurrentUser: '',
            popupActive: false,
            popupMessage: ''
        }
    }

    componentDidMount(): void {
        this.updateListUsers();
        this.initializeAndProvideCurrentUser();
    }
    componentWillUnmount() {
    }



    updateCurrentProfil(userId: string) {
        this.setState({ idCurrentUser: userId });

        this.saveCurrentProfil(userId);
    }

    async saveCurrentProfil(userId: string) {
        try {
            const userToSave: IUserObject = this.state.listAllUsers.find((user: IUserObject) => {
                return user.id.toString() === userId;
            })
            await AsyncStorage.setItem('@connectedUser', JSON.stringify(userToSave))
        } catch (e) {
            console.log("ERROR: + " + e)
        }
    }

    openDeleteConfirmAlert(item: IUserObject): void {
        const title = item.firstName + " " + item.lastName.toUpperCase();
        const test =
            item.adress +
            "\n" +
            item.postalCode + " " + item.city.toUpperCase() +
            "\n" +
            item.birthdate + " " + item.birthplace.toUpperCase();

        Alert.alert(
            title,
            test,
            [
                {
                    text: "Retour",
                    style: "cancel"
                },
                {
                    text: "Supprimer",
                    onPress: () => {
                        DatabaseManager.deleteUserWithId(item.id).then(() => {
                            let message: string = "Profil supprimée";
                            this.setState({ popupActive: true, popupMessage: message })
                            this.updateListUsers();
                        }).catch((err) => {
                            let message: string = "ERREUR : " + err;
                            this.setState({ popupActive: true, popupMessage: message })

                        });
                        this.updateListUsers();
                        if (item.id.toString() === this.state.idCurrentUser) {
                            AsyncStorage.removeItem('@connectedUser');
                        }

                    }
                }
            ],
            { cancelable: false }
        )
    }




    initializeAndProvideCurrentUser(): void {
        this.props.navigation.addListener('focus', () => {
            getCurrentUser().then((user) => {
                if (user !== undefined) {
                    this.setState({ idCurrentUser: user.id.toString() });
                }
            });
        });
    }

    updateListUsers(): void {
        DatabaseManager.getAllUser().then((result: IUserObject[]) => { this.setState({ listAllUsers: result }) });
    }

    renderEmptyProfilList() {
        return (
            <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'center' }}>
                <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ fontWeight: 'bold', fontFamily: 'Arial', }}>Vous n'avez pas de profil</Text>
                    <View style={{ borderBottomColor: '#e50d54', borderBottomWidth: 3, width: '20%', paddingTop: 5 }} ></View>
                </View>

            </View>
        )
    }

    renderProfilList() {
        return (
            <ScrollView style={{ flex: 1 }}>

                <RadioButton.Group onValueChange={(userId: string) => { this.updateCurrentProfil(userId) }} value={this.state.idCurrentUser}>
                    {this.state.listAllUsers.map((item, index) => {

                        return (

                            <View key={item.id} style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', paddingBottom: (this.state.listAllUsers.length - 1) === index ? 10 : 0, paddingTop: 10 }}>

                                <View style={{ flex: 5, flexDirection: 'row' }}>
                                    <View style={{ flexDirection: 'column', justifyContent: 'center' }}>
                                        <RadioButton.Android color='#e50d54' value={item.id.toString()} />
                                    </View>

                                    <View style={{ flex: 1 }}>
                                        <View style={{ flex: 1, flexDirection: 'column' }}>
                                            <View style={{ flex: 1 }}>

                                                <TouchableOpacity onPress={() => { this.updateCurrentProfil(item.id.toString()) }} >
                                                    <View style={{ alignItems: 'center' }}>
                                                        <Text style={{ fontWeight: 'bold', fontFamily: 'Arial', color: this.state.listAllUsers[index].id.toString() === this.state.idCurrentUser ? 'black' : 'gray' }}>
                                                            {item.firstName}{" "}{item.lastName.toUpperCase()}
                                                        </Text>
                                                    </View>
                                                    <View style={{ alignItems: 'center' }}>
                                                        <Text style={{color: this.state.listAllUsers[index].id.toString() === this.state.idCurrentUser ? 'black' : 'gray'}}>
                                                            {item.adress}
                                                        </Text>
                                                    </View>
                                                    <View style={{ alignItems: 'center' }}>
                                                        <Text style={{color: this.state.listAllUsers[index].id.toString() === this.state.idCurrentUser ? 'black' : 'gray'}}>
                                                            {item.postalCode}{" "}{item.city.toUpperCase()}
                                                        </Text>
                                                    </View>
                                                    <View style={{ alignItems: 'center' }}>

                                                        <Text style={{color: this.state.listAllUsers[index].id.toString() === this.state.idCurrentUser ? 'black' : 'gray'}}>
                                                            {item.birthdate}{" "}{item.birthplace.toUpperCase()}
                                                        </Text>

                                                    </View>
                                                </TouchableOpacity>

                                            </View>

                                            {(() => {
                                                if ((this.state.listAllUsers.length - 1) !== index) {
                                                    return (
                                                        <View style={{ flexDirection: 'row', justifyContent: 'center', paddingTop: 10 }}>
                                                            <View style={{ borderBottomWidth: 3, borderBottomColor: '#e50d54', width: '30%' }}>

                                                            </View>
                                                        </View>)
                                                }

                                            })()}


                                        </View>

                                    </View>

                                </View>


                                <View style={{ flex: 1, flexDirection: 'row' }}>

                                    <TouchableOpacity
                                        style={{ flex: 1, borderRadius: 20 }}
                                        onPress={() => this.openDeleteConfirmAlert(item)}

                                    >
                                        <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                                            <Ionicons name={Platform.OS === 'ios' ? "ios-trash" : 'md-trash'} size={30} color='#e50d54' />

                                        </View>

                                    </TouchableOpacity>
                                </View>


                            </View>
                        )
                    })
                    }
                </RadioButton.Group >
            </ScrollView >

        )
    }

    render(): JSX.Element {
        return (
            <View style={{ flex: 1, backgroundColor: 'white' }}>
                {(() => {
                    if (this.state.listAllUsers.length === 0) {
                        return (this.renderEmptyProfilList());
                    } else {
                        return (this.renderProfilList());
                    }
                })()}

                <Snackbar
                    visible={this.state.popupActive}
                    onDismiss={() => { this.setState({ popupActive: !this.state.popupActive }) }}
                    duration={2500}
                    theme={{ colors: { accent: '#e50d54', surface: '#e50d54', onSurface: 'white' } }}
                    action={{
                        label: 'OK',
                        onPress: () => {
                            this.setState({ popupActive: !this.state.popupActive });
                        }
                    }}
                >
                    {this.state.popupMessage}
                </Snackbar>
            </View>







        );
    }
}