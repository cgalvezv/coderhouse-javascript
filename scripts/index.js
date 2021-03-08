
const simulacion = new Simulacion(0, 0, 0);
const cliente = new Cliente('', '', '');


const cambiarValorCliente = (attr) => {
    const valor = document.getElementById(attr).value;
    cliente[attr] = valor;
    localStorage.setItem(attr, valor);
}

const cambiarValorSimulacion = (attr) => {
    const valorDiaUF = Number($('#ind-uf').text().split(':')[1]); // Actualizo valor dia UF
    simulacion.valorDiaUF = valorDiaUF;
    const valor = document.getElementById(attr).value;
    simulacion[attr] = typeof valor === 'string' ? Number(valor) : valor;
    if (attr == 'montoCLP') {
        actualizarMontoUF()
    } else if (attr == 'pie') {
        $("#porcentajePie").html(`<b>${valor}%</b>`);
    }
}

/**
 * Método que genera la simulacion en Unidades de Fomento (UF), para esto se debe ingresar la cantidad del monto solicitado en
 * pesos chilenos (CLP) y el valor da la UF actual. Devuelve el monto solicitado en UF
 */
const generarSimulacion = () => {
    console.log(cliente)
    console.log(simulacion)
    $("#info-text-result").fadeOut();
    let msj = "Falta información para realizar la simulación, todos los campos son requeridos.";
    setTimeout(() => {
        if (simulacion.esValida() && cliente.esValido()) {
            msj = `Sr(a) ${cliente.generarNombreCompleto()}, su simulación ha sido exitosa!. Cualquier información relacionada con esta solicitud se enviara a su e-mail ${cliente.email}`;
            generarBadgeInformativo('success', msj)
            editarSimulacionPantalla(simulacion.generarPie(), simulacion.pie, false);
            generarTablaSimulacion();
        } else {
            generarBadgeInformativo('danger', msj)
        }
    }, 1000)
}

/**
 * Vuelve a 0 la simulación
 */
const limpiarSimulacion = () => {
    removerBadgeInformativo();
    editarSimulacionPantalla(0, 0, true);
    localStorage.removeItem("nombre");
    localStorage.removeItem("apellido");
    localStorage.removeItem("email");
}

/**
 * Función que muestra en pantalla el resultado de la simulación realizada
 * @param {string} nombre es el nombre del usuario que se mostrará en el simulador
 * @param {string} email  es el email del usuario que se mostrará en el simulador
 * @param {string} infoPie es la informacion relacionada acerca del pie a dar
 * @param {number} valorPie es el valor del pie a dar
 * @param {boolean} clean es una bandera para saber si es necesario limpiar la información en pantalla o no
 */
const editarSimulacionPantalla = (infoPie, valorPie, clean) => {
    switch (clean) {
        case true:
            $("#nombre").val("");
            $("#apellido").val("");
            $("#email").val("");
            $("#montoCLP").val("");
            $("#infoPie").html("");
            $("#porcentajePie").html("<b>0%</b>");
            $("#pie").val(0);
            $("#montoUF").val(0);
            $("#tabla-simulacion_wrapper").html("")
            $("#info-text-result").fadeIn();
            break;
        default:
            $("#infoPie").html(`${infoPie}`);
            $("#porcentajePie").html(`<b>${valorPie}%</b>`);
            break;
    }
    
}

/**
 * Generá html del badge que muestra información relacionada con el resultado de la simulación
 * @param {string} estado es el estado que tomará el badge ['success', 'danger']
 * @param {string} mensaje mensaje que contendrá el badge
 */
const generarBadgeInformativo = (estado, mensaje) => {
    removerBadgeInformativo();
    $("<div/>").attr("id", "badge-informativo")
            .addClass(`alert alert-${estado}`)
            .attr("role", "role")
            .html(mensaje)
            .appendTo("#resultadoSimulacion")
}

/**
 * Remueve el badge informativo si es que existe
 */
const removerBadgeInformativo = () => {
    const badge = $("#badge-informativo");
    if (badge) {
        badge.remove();
    }
}

/**
 * Función que a partir del valor diario de la UF, convierte el monto solicitiado a la misma unidad
 */
const actualizarMontoUF = () => {
    let outputUF = 0;
    if (simulacion.montoCLP > 0) {
        outputUF = simulacion.generarMontoUF();
    }
    $("#montoUF").val(`${outputUF}`);
}

/**
 * Función que realiza la generación de la simulacion, cuando se presiona ENTER
 * @param {object} event es el evento recibido
 */
const enviarSimulaciónManual = (event) => {
    if (event.which == 13 || event.keyCode == 13) {
        generarSimulacion();
    }
}

/**
 * renderiza tabla informativa resultante de la simulación en la página
 */
const generarTablaSimulacion = () => {
    $("#tabla-simulacion_wrapper").hide();
    $("#tabla-simulacion_wrapper").html(generarHTMLTablaSimulacion())
    obtenerSimulacionTasaInfoEnTabla(simulacion.montoCLP, simulacion.generarPieMonto());
    $("#tabla-simulacion_wrapper").show();
}


/**
 * Genera HTML de estructura principal de la tabla informativa resultante de la simulación
 */
const generarHTMLTablaSimulacion = () => `
    <table id="tabla-simulacion" class="table">
        <thead>
        <tr>
            <th scope="col">Años</th>
            <th scope="col">Cuotas</th>
            <th scope="col">Tasa</th>
            <th scope="col">Dividendo (CLP)</th>
            <th scope="col">Monto Final Crédito (CLP)</th>
        </tr>
        </thead>
        <tbody id="tabla-simulacion_body">
        </tbody>
    </table>
    `;

/**
 * obtiene la informacion para generar tabla informativa resultante de la simulación
 * @param {number} montoCLP es el monto del crédito solicitado en CLP
 * @param {number} pie es el pie dado para el crédito
 */
const obtenerSimulacionTasaInfoEnTabla = (montoCLP, pie) => {
    $.ajax({
        url: '../data/info_simulación.json',
        dataType: 'json',
        success: (res) => {
            generarHTMLContenidoTablaSimulación(montoCLP, pie, res);
        }
    })
}

const obtenerIndicadoresEconomicos = () => {
    $.ajax({
        url: 'https://mindicador.cl/api',
        dataType: 'json',
        success: (indicators) => {
            const {uf, euro, dolar, dolar_intercambio, utm, bitcoin, ivp} = indicators;
            generarHTMLIndicadorEconomico(dolar);
            generarHTMLIndicadorEconomico(dolar_intercambio);
            generarHTMLIndicadorEconomico(euro);
            generarHTMLIndicadorEconomico(uf);
            generarHTMLIndicadorEconomico(utm);
            generarHTMLIndicadorEconomico(ivp);
            generarHTMLIndicadorEconomico(bitcoin);
        }
    })
}

const generarHTMLIndicadorEconomico = (indicador) => {
    $("#daily-indicators").append(`
        <li id="ind-${indicador.codigo}" class="list-group-item">
            ${indicador.nombre} ${indicador.unidad_medida === 'Dólar' ? '(USD)' : ''}  ${formatearCLP(parseInt(indicador.valor))}
        </li>
    `)
}


/**
 * Genera HTML del contenido principal de la tabla informativa resultante de la simulación
 */
const generarHTMLContenidoTablaSimulación = (montoCLP, pie, datas) => {
    datas.forEach(data => {
        const montoFinal = montoCLP - pie;
        const montoMensuales = montoFinal / data.cuotas;
        const interesEnCLP = parseInt(montoMensuales - (montoMensuales * (data.tasa / 100)));
        const dividendo = parseInt(montoMensuales + interesEnCLP);
        $("#tabla-simulacion_body").append(`
            <tr>
                <th scope="row">${data.cuotas / 12}</th>
                <td>${data.cuotas}</td>
                <td>%${data.tasa}</td>
                <td>${formatearCLP(dividendo)}</td>
                <td>${formatearCLP(dividendo * data.cuotas)}</td>
            </tr>
        `);
    })
}

const formatearCLP = (monto) => new Intl.NumberFormat('es-CL', {currency: 'CLP', style: 'currency'}).format(monto);


$(document).ready(() => {
    $("#tabla-simulacion_wrapper").hide();
    // Procesar info cliente desde LocalStorage
    $("#nombre").val(localStorage.getItem("nombre") || ""); cambiarValorCliente("nombre");
    $("#apellido").val(localStorage.getItem("apellido") || ""); cambiarValorCliente("apellido");
    $("#email").val(localStorage.getItem("email") || ""); cambiarValorCliente("email");
    // Lógica para enviar simulacion con enter
    obtenerIndicadoresEconomicos();
    $(document).keypress((event) => enviarSimulaciónManual(event));
});