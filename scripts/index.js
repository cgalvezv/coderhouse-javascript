
const simulacion = new Simulacion(0, 0, 0, 0, {});
const cliente = new Cliente('', '', '');


//#region MÉTODOS PARA LOS EVENTOS ONCHANGE
/**
 * Método que agrega al modelo Cliente, sus respectivos atributos
 * @param {string} attr nombre del atributo que se desea agregar al modelo
 */
const cambiarValorCliente = (attr) => {
    const valor = document.getElementById(attr).value;
    cliente[attr] = valor;
    localStorage.setItem(attr, valor);
}

/**
 * Método que agrega al modelo Simulacion, sus respectivos atributos
 * @param {string} attr nombre del atributo que se desea agregar al modelo
 */
const cambiarValorSimulacion = (attr) => {
    const valorUFlimpio = $('#ind-uf').text().split(': $')[1].replace(/\./g, ''); // Obtengo el string del valor UF
    const valorDiaUF = Number(valorUFlimpio); // Actualizo valor dia UF
    simulacion.valorDiaUF = parseInt(valorDiaUF);
    const valor = document.getElementById(attr).value;
    simulacion[attr] = typeof valor === 'string' ? Number(valor) : valor;
    if (attr == 'montoCLP') {
        actualizarMontoUF()
    } else if (attr == 'pie') {
        $("#porcentajePie").html(`<b>${valor}%</b>`);
    }
}

/**
 * Método que implementa los eventos necesarios para obtener la información de las caracteristicas del crédito
 */
const obtenerEventosCaracteristicasCredito = () => {
    $("#tipoCredito").change(() => {
        const valorSeleccionado = $("#tipoCredito option:selected").val();
        if (valorSeleccionado === 'hipotecario') {
            $("#estadoVivienda_wrapper").fadeIn()
        } else {
            $("#estadoVivienda_wrapper").fadeOut()
        }

        if (valorSeleccionado !== 'Seleccione...') {
            simulacion.agregarCaracterisitica('tipo_credito', valorSeleccionado);
        } else {
            simulacion.caracteristicasCredito = {};
        }
    })
    $("#mesesGracia").change(() => {
        const valorSeleccionado = $("#mesesGracia option:selected").val();
        simulacion.mesesGracia = parseInt(valorSeleccionado)
    })
    $("#estadoVivienda").change(() => {
        const valorSeleccionado = $("#estadoVivienda option:selected").val();
        simulacion.agregarCaracterisitica('estado_vivienda', valorSeleccionado);
    })
}
//#endregion MÉTODOS PARA LOS EVENTOS ONCHANGE

//#region MÉTODOS PARA IMPLEMENTAR LÓGICA DE INDICADORES ECONÓMICOS

/**
 * Método que renderiza los indicadores económicos en la página
 * @param {object} indicador es el objeto con la información del indicador que se desea renderizar
 */
const generarHTMLIndicadorEconomico = (indicador) => {
    $("#daily-indicators").append(`
        <li id="ind-${indicador.codigo}" class="list-group-item">
            ${indicador.nombre} ${indicador.unidad_medida === 'Dólar' ? '(USD)' : ''}: ${formatearCLP(parseInt(indicador.valor))}
        </li>
    `)
}

/**
 * Método que obtiene indicadores económicos desde API 'mindicador.cl'
 */
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
//#endregion MÉTODOS PARA IMPLEMENTAR LÓGICA DE INDICADORES ECONÓMICOS

//#region MÉTODOS PARA IMPLEMENTAR LÓGICA DE LA SIMULACIÓN Y SU RESULTADO
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
            generarCaracteristicasCredito()
            generarTablaSimulacion();
        } else {
            generarBadgeInformativo('danger', msj)
            $("#tabla-simulacion_wrapper").hide();
            $("#caracteristica-credito_wrapper").hide();
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
            $("#tipoCredito").val("");
            $("#mesesGracia").val("");
            $("#estadoVivienda").val("");
            $("#montoCLP").val("");
            $("#infoPie").html("");
            $("#porcentajePie").html("<b>0%</b>");
            $("#pie").val(0);
            $("#montoUF").val(0);
            $("#tabla-simulacion_wrapper").html("")
            $("#caracteristica-credito_wrapper").html("")
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
            .appendTo("#resultado-simulacion_wrapper")
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
 * Renderiza lista con las caracteristcas del crédito de la simulación en la página
 */
const generarCaracteristicasCredito = () => {
    $("#caracteristica-credito_wrapper").hide();
    $("#caracteristica-credito_wrapper").html(generarHTMLCaracteristicasCredito());
    obtenerCaracteristicasCredito()
    $("#caracteristica-credito_wrapper").show();
}

/**
 * Genera HTML de estructura principal de la lista con las caracteristcas del crédito
 */
const generarHTMLCaracteristicasCredito = () => `
        <br>
        <h5 class="h5">Características del crédito</h5>
        <ul id="lista-caracteristicas" class="list-group">
            <li class="list-group-item d-flex justify-content-between align-items-center">
                MESES DE GRACIA
                <span class="badge bg-info rounded-pill">${simulacion.mesesGracia}</span>
            </li>
        </ul>
        <br>
`;

/**
 * Genera HTML del contenido principal de la lista con las caracteristcas del crédito
 */
const obtenerCaracteristicasCredito = () => {
    for (const llave in simulacion.caracteristicasCredito) {
        if (Object.hasOwnProperty.call(simulacion.caracteristicasCredito, llave)) {
            const caracteristica = simulacion.caracteristicasCredito[llave];
            $("#lista-caracteristicas").append(`
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    ${String(llave).replace('_', ' ').toLocaleUpperCase()}
                    <span class="badge bg-info rounded-pill">${String(caracteristica).toLocaleUpperCase()}</span>
                </li>
            `);   
        }
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
//#endregion MÉTODOS PARA IMPLEMENTAR LÓGICA DE LA SIMULACIÓN Y SU RESULTADO

$(document).ready(() => {
    // Se esconden información resultante de la simulación
    $("#tabla-simulacion_wrapper").hide();
    $("#caracteristica-credito_wrapper").hide();
    $("#estadoVivienda_wrapper").hide();
    // Procesar info cliente desde LocalStorage
    $("#nombre").val(localStorage.getItem("nombre") || ""); cambiarValorCliente("nombre");
    $("#apellido").val(localStorage.getItem("apellido") || ""); cambiarValorCliente("apellido");
    $("#email").val(localStorage.getItem("email") || ""); cambiarValorCliente("email");
    // Inicialización de lógica para obtener de API 'mindicador.cl' información de indicadores económicos
    obtenerIndicadoresEconomicos();
    actualizarFechaHoy('fechaHoy');
    // Inicialización de evento para enviar simulacion con ENTER
    $(document).keypress((event) => enviarSimulaciónManual(event));
    // Inicialización de lógica para obtener eventos correspondientes a la caracteristicas del crédito
    obtenerEventosCaracteristicasCredito();
});