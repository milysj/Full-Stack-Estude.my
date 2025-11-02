import axios from "axios";


export async function getPerguntas() {
const resp = await axios.get("/api/perguntas");
return resp.data;
}


export async function registrarResultado(acertou: boolean) {
return axios.post("/api/resultados", { acertou });
}