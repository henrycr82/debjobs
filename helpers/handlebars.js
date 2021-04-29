module.exports = {
    seleccionarSkills : (seleccionadas = [], opciones) => {
        
        //console.log(seleccionadas);
        //console.log(opciones);
        
        const skills = ['HTML5', 'CSS3', 'CSSGrid', 'Flexbox', 'JavaScript', 'jQuery', 'Node', 'Angular', 'VueJS', 'ReactJS', 'React Hooks', 'Redux', 'Apollo', 'GraphQL', 'TypeScript', 'PHP', 'Laravel', 'Symfony', 'Python', 'Django', 'ORM', 'Sequelize', 'Mongoose', 'SQL', 'MVC', 'SASS', 'WordPress'];

        let html = '';
        skills.forEach(skill => {
            /*html += `
                <li>${skill}</li>
            `;*/
            //Si existe una skills en el arreglo seleccionadas la incluyo en el objeto html
            //de lo contrario no la incluyo (activo o desactivo)
            //el includes() revisa si existe o no una skills en el arreglo y devuelve true o false 
            html += `<li ${
                seleccionadas.includes(skill) ? 'class="activo"' : ''
            }>${skill}</li>`;
        });

        return opciones.fn().html = html;
    },
    //seleccionado (contrato que viene de la bd), opciones (options)
    tipoContrato: (seleccionado, opciones) => {
        /*console.log(opciones.fn());
        console.log(seleccionado);*/
        //Recorremos las opciones del select (options) y inyectamos o el elemento que viene de la bd (seleccionado)
        return opciones
          .fn(this)
          .replace(
            new RegExp(` value="${seleccionado}"`),
            '$& selected="selected"'
          );
    },
    mostrarAlertas: (errores = {}, alertas) => {
        const categoria = Object.keys(errores);
        //console.log(errores[categoria]);
    
        let html = '';
        if (categoria.length) {
          errores[categoria].forEach((error) => {
            html += `<div class="${categoria} alerta">
                ${error}
            </div>`;
          });
        }
        return (alertas.fn().html = html);
    }
}