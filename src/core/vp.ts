
// import libs
import {
    Component,
    Temperature,
    Pressure,
    CustomProp,
    CustomProperty,
    ComponentKey,
    set_component_id
} from "mozithermodb-settings"
import { Source, MoziEquation, ComponentEquationSource } from "mozithermodb"

// ! LOCALS
import { VaPr_SYMBOL } from "@/configs/thermo-props";
import { R_J_molK, T_ref_K } from "@/configs/constants";

/**
 * Component vapor pressure class used to calculate the following properties:
 * - Saturation pressure VaPr(T)
 * - Enthalpy of vaporization EnVap(T)
 * - Temperature at given vapor pressure TeVaPr(P)
 *
 * Notes
 * -----
 * - All calculations are based on the vapor pressure equation retrieved from the source for the given component.
 * - `Pressure` unit defined in the model source should be in `Pa`.
 * - `Temperature` unit defined in the model source should be in `K`.
 */
export class ComponentVaporPressure {
    //  NOTE: attributes
    T_ref = T_ref_K  // reference temperature in K
    R = R_J_molK  // universal gas constant in J/mol.K

    // NOTE: component id
    componentId: string
    // NOTE: vapor pressure equation
    VaPr_eqSrc: Record<string, ComponentEquationSource> | null = null
    VaPrComponent_eqSrc: ComponentEquationSource | null = null

    // SECTION: constructor
    constructor(
        public component: Component,
        public source: Source,
        public componentKey: ComponentKey = 'Name-Formula',
    ) {
        // NOTE: set component id for the component
        this.componentId = set_component_id(this.component, this.componentKey)

    }
}