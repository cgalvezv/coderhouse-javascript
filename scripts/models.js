class Cliente {
    /**
     * 
     * @param {string} nombre es el nombre del usuario que esta solicitando el crédito
     * @param {string} apellido es el apellido del usuario que esta solicitando el crédito
     * @param {string} email es el e-mail del usuario que solicita el crédito
     */
    constructor(nombre, apellido, email) {
        this.nombre = nombre;
        this.apellido = apellido;
        this.email = email;
    }

    generarNombreCompleto() {
        return `${this.nombre} ${this.apellido}`;
    }

    esValido() {
        return (this.nombre !== '' && this.nombre !== null && this.nombre !== undefined) &&
            (this.apellido !== '' && this.email !== null && this.email !== undefined) &&
            (this.email !== '' && this.email !== null && this.email !== undefined);
    }
}

/**
 * Este objeto representa la simulación del crédito a solicitar
 */
class Simulacion {
    /**
     * 
     * @param {number} montoSolicitadoCLP es el monto solicitado en CLP (Pesos chilenos)
     * @param {number} valorDiaUF es el valor a tiempo real de la UF
     */
    constructor(montoSolicitadoCLP, valorDiaUF, pie) {
        this.valorDiaUF = valorDiaUF;
        this.montoCLP = montoSolicitadoCLP;
        this.pie = pie;
    }

    generarMontoUF() {
        return Math.floor(this.montoCLP/this.valorDiaUF);
    }

    /**
     * Lógica que valida el pie ingresado por el usuario
     */
    generarPie() {
        if(this.pie >= 0 && this.pie < 10) {
            return 'El banco solo permite un pie mayor al 10% del monto solicitado';
        }
        const valorPieCLP = Math.floor((this.montoCLP * this.pie)/100)
        const valorPieUF = Math.floor(valorPieCLP / this.valorDiaUF);
        return `Valor pie: $${valorPieCLP} [${valorPieUF} UF]`;
    }

    generarPieMonto() {
        return Math.floor((this.montoCLP * this.pie)/100)
    }

    /**
     * Chequea si las propiedades de la simulacion son validas
     */
    esValida() {
        return (this.montoCLP > 0 && this.montoCLP !== null && this.montoCLP !== undefined) &&
            (this.valorDiaUF > 0 && this.valorDiaUF !== null && this.valorDiaUF !== undefined) &&
            (this.pie > 0 && this.pie !== null && this.pie !== undefined)
    }
}