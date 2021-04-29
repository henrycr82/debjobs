import axios from 'axios';
import Swal from 'sweetalert2';
                  
document.addEventListener('DOMContentLoaded',() =>{
    //ul lista-conocimientos de (nueva-vanate.handlebars y editar-vacante.handlebars)
    const skills = document.querySelector('.lista-conocimientos');

    //limpiar alertas (el div alertas esta en layout.handlebars)
    let alertas = document.querySelector('.alertas');

    if (alertas) {
        limpiarAlertas();
    }

    if(skills){
        skills.addEventListener('click', agregarSkills);

        //una vez que estamos en editar, llamar la función
        skillsSeleccionados();
    }
  
    //div con la clase panel-administracion en la pagína administracion.handlebars
    const vacantesListado = document.querySelector('.panel-administracion');

    if (vacantesListado) {
        vacantesListado.addEventListener('click', accionesListado);
    }
        
})

const skills = new Set();
const agregarSkills = e =>{
    //console.log(e.target);

    //Si se hace click en un elemento (li) de la (lista-conocimientos ul) de (nueva-vanate.handlebars)
    if(e.target.tagName === 'LI'){
        //si un elemento (li) esta activo y hacemos click sobre el lo desactivamos y borramos de la lista
        if(e.target.classList.contains('activo')){
            skills.delete(e.target.textContent);
            e.target.classList.remove('activo');
        //Si hacemos click sobre un elemento (li) que no este activo lo agregamos a la lista y lo activamos
        }else{
            skills.add(e.target.textContent);
            e.target.classList.add('activo');
        }
    }
    //hacemos una copia del Set skills con object literal pero convertida en un arreglo
    const skillsArray = [...skills]
    //agregamos el arreglo skillsArray al input de id 'skills' de (nueva-vanate.handlebars)
    document.querySelector('#skills').value = skillsArray;
    
    
}

const skillsSeleccionados = () => {

    //ul 'lista-conocimientos' que posean en estilo '.activo'de editar-vacante.handlebars
    //para convertir el NodeList en un arreglo usamos Array.from()
    const seleccionadas = Array.from(document.querySelectorAll('.lista-conocimientos .activo'));

    seleccionadas.forEach(seleccionada => {
        skills.add(seleccionada.textContent);
    })

    //inyectarolo en el input hidden 'skills' de editar-vacante.handlebars
    //hacemos una copia del Set skills con object literal pero convertida en un arreglo
    const skillsArray = [...skills]
    //agregamos el arreglo skillsArray al input hidden 'skills' de (editar-vacante.handlebars)
    document.querySelector('#skills').value = skillsArray;

}

const limpiarAlertas = () => {
    const alertas = document.querySelector('.alertas');//hasta los momentos solo en crear-cuenta.handlebars
    const interval = setInterval(() => {
        //Si hay hijos
        if (alertas.children.length > 0) {
            alertas.removeChild(alertas.children[0]);//Se eliminan los hijos
        } else if (alertas.children.length === 0) {
            alertas.parentElement.removeChild(alertas);//se elimina el padre
            clearInterval(interval);
        }
    }, 2000);
};

//Eliminar vacantes
const accionesListado = e => {
    e.preventDefault();
    //si hacemos click en el enlace <a> con el atributo personalizado 'data-eliminar' de administracion.handlebars
    if (e.target.dataset.eliminar) {
        
        Swal.fire({
            title: '¿Estas seguro de eliminar la vacante?',
            text: "¡Una vez eliminada,no se puede recuperar!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: '¡Si, Eliminar!',
            cancelButtonText: '¡No, Cancelar!'
            }).then((result) => {
            if (result.isConfirmed) {
                
                //construir la url
                const url = `${location.origin}/vacantes/eliminar/${e.target.dataset.eliminar}`;
                
                //enviar lapetición con axios
                axios.delete(url, { params : {url} })
                    .then(function(respuesta){
                        if (respuesta.status === 200) 
                        {
                            Swal.fire(
                                '¡Eliminada!',
                                respuesta.data,
                                'success'
                            );

                            //console.log(e.target);
                            e.target.parentElement.parentElement.parentElement.removeChild(e.target.parentElement.parentElement);
                        }
                    })
                    .catch(()=> {
                        Swal.fire({
                            type:'error',
                            title:'¡Error!',
                            text: respuesta.data
                      })
                    });
            }
        })

    } else if (e.target.tagName=== 'A'){
        //hacemos que todo siga su curso
        //que los enlaces de candidatos y editar vacante ejecuten sus respectivas url's
        window.location.href = e.target.href;
    }
    
}

