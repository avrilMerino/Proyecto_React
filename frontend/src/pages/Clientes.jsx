import{ useEffect, useState } from "react";
import axios from "axios";

const API = "http://localhost:4000";

export default function Clientes(){
    //-------
    //ESTADOS
    //-------
    const [busqueda, setBusqueda] = useState("");
    const [clientes, setClientes] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState("");

    //FORMULARIO: añade y edita clientes
    const[form, setForm] = useState({
        id_cliente:null,
        nombre: "",
        apellido1: "",
        apellido2: "",
        email:"",
        codigo_postal: "",
        activo: true
    });

    const [modoEdicion, setModoEdicion] = useState(false);

    //CARGAR CLIENTES list + search
    const cargarClientes = async()=>{
        try{
            setError("");
            setCargando(true);

            const url = busqueda.trim()
                ? `${API}/clientes?search=${encodeURIComponent(busqueda.trim())}`
                : `${API}/clientes`;
            
               const rtesp = await axios.get(url);
               setClientes(resp.data);
        }catch(e){
            setError("No se pudieron cargar los clientes");
            setCargando(false);
        }
    };

    //useEffect: CADA VEZ QUE CAMBIE LA BÚSQUEDA, RECARGO LA TABLA
    useEffect(()=>{
        const t = setTimeout(() => {
            cargarClientes();
        }, 250 ); //mini debounce para no pedir cada tecla al instante

        return () => clearTimeout(t);
        //eslint-disable-next-line react-hooks/exhaustive-deps
    }, [busqueda]);
    
    //MANEJO DEL FORMULARIO
    const onChangeForm = (e) => {
        const { name, value, type, checked } = e.target;

        setForm((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value
        }));
    };

    const limpiarForm = () => {
        setForm({
            id_cliente: null,
            nombre: "",
            apellido1: "",
            apellido2: "",
            email: "",
            codigo_postal: "",
            activo: true
        });
        setModoEdicion(false);
    };

    const cargarParaEditar = (cliente) => {
        setForm({
            id_cliente: cliente.id_cliente ,
            nombre: cliente.nombre ,
            apellido1: cliente.apellido1 ,
            apellido2: cliente.apellido2 ,
            email: cliente.email ,
            codigo_postal: cliente.codigo_postal ,
            activo: Bolean(cliente.activo)
        });
        setModoEdicion(true);
    };

    // CREATE / UPDATE




}