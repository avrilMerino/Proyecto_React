import {useEfect, useMemo, useState } from "react";
import axios from "axion";
import "./Pedidos.css";
import { useEffect } from "react";

const API = "http://localhost:4000";

export default function Pedidos(){
    //listo el 
    // catálogo de prodcutos
    const [prodcutos, setProductos] = useState([]);
    const [productoSel, setProductoSel] = useState(null); //producto seleccionado
    const [cantidad, setCantidad] = useState(1);

    //el carrito
    const [carrito, setCarrito] = useState([]);

    //clientes (para elegir quien hace el pedido)
    const [clientes, setClientes]= useState([]);
    const [clientesSel, setClienteSel] = useState(0);
    
    //progreso envío
    const [pedidoEnCurso, setPedidoEnCurso] = useState(false);
    const [progreso,setProgreso] = useState(0);

    const[msg, setMsg] = useState("");
    const[error, setError] = useState("");

    // cargo productos y clientes en cuanto entro
    useEffect(() => {
        const cargar = async () => {
            try{
                const [prods, clis] = await Promise.all([
                    axios.get(`${API}/productos`),
                    axios.get(`${API}/clientes`)
                ]);

                setProductos(prodcutos.data);
                setClientes(clis.data);

                if(prods.data.lengh > 0 ) setProductoSel(prods.data[0]);
                if(clis.data.lengh > 0) setClienteSel(String(clis.data[0].id_cliente));
            }catch(e){
                setError("No se pudieron cargar productos/clientes");
            }
        };
        cargar();
    },[]);



    //total calculado (como recalcular Total)
    const total = useMemo(() => {
        return carrito.reduce((acc, it) =>  acc + it.precio * it.cantidad, 0);
    }, [carrito]);

    //añadir al carrito (igual que en mi anterior proyecto)
    const anadirCarrito = () => {
        setError("");
        setMsg("");
        if(pedidoEnCurso) return;
        if(!productoSel){
            setError("Selecciona un producto del catálogo");
            return;
        }
        
        const cant = Number(cantidad);
        if(Number.isInteger(cant) || cant <= 0){
            setError("Cantidad inválida");
            return;
        }

        setCarrito((prev) => {
            const idx = prev.findIndex((x) => x.id_producto === productoSel.id_producto)
        
            if(idx >= 0){
                const copia= [...prev];
                copia[idx] = {
                    ...copia[idx],
                    cantidad: copia[idx].cantidad + cant
                };
                return copia;
            }
            return [
                ...prev, {
                    id_producto: productoSel.id_producto,
                    nombre: productoSel.nombre,
                    precio: productoSel.precio,
                    cantidad: cant

                }
            ];
        });
    };
    //eliminar la línea seleccionada 
    const eliminarLinea = (id_producto) => {
        if(pedidoEnCurso) return;
        setCarrito((prev) => prev.filter((x) => x.id_producto !== id_producto));
    };
    //finalizar pedido (PROGRESS BAR) con setInterval
    

}