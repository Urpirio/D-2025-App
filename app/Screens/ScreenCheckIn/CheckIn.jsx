import { SafeAreaProvider } from "react-native-safe-area-context";
import { CameraView,useCameraPermissions,CameraType } from "expo-camera";
import { useState,useEffect } from "react";
import { TouchableOpacity,View,Text, Image} from "react-native";
import { useRouter,useLocalSearchParams, useFocusEffect } from "expo-router";
import Modal_IngresarCodigo from "../../../Components/Components - ScreenCheckIn/Modales/Modal_IngresarCodigo";
import { StatusBar } from "expo-status-bar";
import QR_Mask from "../../../Components/Components - ScreenCheckIn/Masks/QR_Mask";
import { StyleCheckIn } from "../../../style/Style - ScreenCheckIn/StyleCheckIn";
import Modalloading from "../../../Components/Components - ScreenCheckIn/Modales/Modalloading";
import ModalParticipante from "../../../Components/Components - ScreenCheckIn/Modales/ModalParticipante";
import ModalNoMatch from "../../../Components/Components - ScreenCheckIn/Modales/ModalNoMatch";
import useValidate from "../../../hooks/hooks - ScreenCheckIn/useValidate";
import ModalNotInEvent from "../../../Components/Components - ScreenCheckIn/Modales/ModalNotInEvent";
import Modal_Registrado from "../../../Components/Components - ScreenCheckIn/Modales/Modal_Registrado";
import ModalEnEvento from "../../../Components/Components - ScreenCheckIn/Modales/ModalEnEvento";
import PermisoCamara from "../../../Components/Components - ScreenCheckIn/AvisosPermiso/PermisoCamara";
import { useCallback } from "react";


export default function CheckIn() {

    const router = useRouter();
    const [WhatCamera,setWhatCamera] = useState('back');
    const [HavePermission,setHavePermission] = useCameraPermissions();
    const [IsRegistrado,setIsRegistrado] = useState(false);
    const [ZOOM,setZOOM] = useState(0);
    const [More,setMore] = useState(false);
    const [Less, setLess] = useState(false);

    const [StyleBtnLinterna,setStyleBtnLinterna] = useState({
        btn: StyleCheckIn.BtnLinternaOFF,
        Status: false,
    });

    const [isFocused, setIsFocused] = useState(true); 

    //Evita que la camara se ponga negra
    useFocusEffect(useCallback(() => {
        setIsFocused(true);
        return () => {
            setIsFocused(false);
        };
    }, []))

    useEffect(()=>{
        if(More &&  ZOOM < 1){
            setZOOM(ZOOM + 0.1)
        };

        if(Less && ZOOM > 0){
            setZOOM(ZOOM - 0.1)
        };
    },[More,Less,ZOOM]);

    
    
    
    const LocalData = useLocalSearchParams();
    
    const { 
        CodeScanned,
        Loading,
        StatusPar,
        ResetStatusPar,
        DataUsers,
        NoMatchUser,
        CloseError,
        NotInEvent,
        setNotInEvent,
        StatusModalIngCodigo,
        setStatusModalIngCodigo,
        UserID,
        Ischeckin,
        setISCheckin,
    } = useValidate();

  
  
    if(!HavePermission){
        return(
            <View/>
        )
    };

    if(!HavePermission.granted){
        return(
            <PermisoCamara 
            setHavePermission={()=>{setHavePermission(!HavePermission);}}
            router={router}  
            />
        )
    };

    if (!isFocused) {
        return null; 
    }

    


    return (
        <SafeAreaProvider>
            
            <CameraView zoom={ZOOM} facing={WhatCamera}  key={WhatCamera} enableTorch={StyleBtnLinterna.Status} 
                onBarcodeScanned={(Data)=>{CodeScanned({DataScanned:Data,TokenUser: LocalData.TokenAccess,
                EventId: LocalData.IDEvents})}} style={{flex:1}} Flash = "auto"/>
                
                <QR_Mask 
                Zoom_LessIN={()=>{
                    setLess(true)
                }}
                Zoom_moreIN={()=>{
                    setMore(true)
                }}
                Zoom_LessOUT={()=>{
                    setLess(false)
                }}
                Zoom_moreOUT={()=>{
                    setMore(false)
                }}
                />

                <View style={StyleCheckIn.containerBtns}>
                    <TouchableOpacity style={StyleBtnLinterna.btn} onPress={()=>{
                        if(!StyleBtnLinterna.Status){
                            setStyleBtnLinterna({
                                btn:StyleCheckIn.BtnLinternaON,
                                Status: true,
                            })
                        }else{
                            setStyleBtnLinterna({
                                btn:StyleCheckIn.BtnLinternaOFF,
                                Status: false,
                            })
                        };
                    }}>
                        <Image style={StyleCheckIn.IconLinterna} source={require('../../../assets/IconCheckIn/bolt.png')}/>
                    </TouchableOpacity>
                    <TouchableOpacity style={StyleCheckIn.BtnIngresarCodigo} 
                        onPress={()=>{
                            setStatusModalIngCodigo(!StatusModalIngCodigo)
                        }}>
                        <Text style={StyleCheckIn.TextBtnIngresarCodigo}>Ingresar codigo</Text>
                    </TouchableOpacity>
                    
                </View>

                <Modal_IngresarCodigo
                StatusModal={StatusModalIngCodigo}
                FunctionCloseModal={()=>{
                    setStatusModalIngCodigo(!StatusModalIngCodigo)
                }}
                ValidarQR={({TextCode})=>{
                    CodeScanned({DataScanned: {data: TextCode},TokenUser: LocalData.TokenAccess,EventId: LocalData.IDEvents})
                }}
                />

                <Modalloading StatusLoading={Loading}/>
                
                <ModalParticipante 
                    StatusModal={StatusPar}
                    FuncionCancelar={ResetStatusPar}
                    Data={DataUsers}
                    TokenAccess={LocalData.TokenAccess}
                    EventId={LocalData.IDEvents}
                    user_id={UserID}
                    FuncionRegistrado={()=>{
                        setIsRegistrado(true);
                        ResetStatusPar();
                    }}
                    
                />

                <ModalNoMatch 
                StatusModal={NoMatchUser}
                CloseModal={CloseError}
                OpenIngresarCodigo={()=>{
                    CloseError();
                    setStatusModalIngCodigo(!StatusModalIngCodigo);
                }}
                />

                <ModalNotInEvent
                    StatusModal={NotInEvent}
                    FuncionCancelar={()=>{
                        setNotInEvent(false);
                    }}
                    FuncionExitoso={()=>{
                        setIsRegistrado(true);
                    }}
                    Data={DataUsers}
                    EventId={LocalData.IDEvents}
                    TokenAccess={LocalData.TokenAccess}
                    StaffID={LocalData.StaffId}
                />

                <Modal_Registrado
                StatusModal={IsRegistrado}
                FuncionVolver={()=>{
                    setIsRegistrado(false);
                    router.back();
                }}
                FuncionOtraEntrada={()=>{
                    setIsRegistrado(false)
                }}
                />

                <ModalEnEvento
                StatusModal={Ischeckin}
                FuncionCerrar={()=>{
                    setISCheckin(false);
                }}
                />

               <StatusBar style="auto"/>
        </SafeAreaProvider>
    ) 
};
