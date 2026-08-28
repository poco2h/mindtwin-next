import { guardarDemoTwin, type DemoTwin } from "@/lib/demo/localTwin";

export function limpiarDatosEjemplo() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem("mindtwin_demo_profile");
    window.localStorage.removeItem("mindtwin_marcas");
  }
}
