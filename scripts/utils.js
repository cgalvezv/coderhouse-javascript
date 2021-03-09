/**
 * Método que aplica formato de CLP a un monto ingresado
 * @param {string} monto es el monto que se desea formatear
 * @returns el monto ingresado en formato de CLP
 */
const formatearCLP = (monto) => new Intl.NumberFormat('es-CL', {currency: 'CLP', style: 'currency'}).format(monto);

/**
 * Método que retorna el largo de un objeto dado
 * @param {object} obj objeto al cual se le desea saber el largo de pares {key, value}
 * @returns el largo del objeto
 */
const lenObjeto = (obj) => {
    let len = 0;
    for (const key in obj) {
        if (Object.hasOwnProperty.call(obj, key)) {
            len++;
        }
    }
    return len;
}

/**
 * Método que agrega al DOM la fecha de hoy
 * @param {string} idTarget es el elemento del DOM donde se le desea agregar la fecha de hoy
 */
const actualizarFechaHoy = (idTarget) => {
    const event = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    $(`#${idTarget}`).html(`La fecha de hoy es ${event.toLocaleDateString('es-ES', options)}`);
}