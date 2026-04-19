import { useState } from "react";
import { supabase } from "./supabase";

export default function App() {
  const [valor, setValor] = useState("");

  async function salvar() {
    const { error } = await supabase.from("investments").insert([
      {
        asset: "Manual",
        category: "Geral",
        amount: Number(valor),
        price: 1,
      },
    ]);

    if (error) {
      alert("Erro: " + error.message);
    } else {
      alert("Salvo no banco!");
      setValor("");
    }
  }

  return (
    <div
      style={{
        background: "#070b17",
        color: "white",
        minHeight: "100vh",
        padding: "30px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1>💎 Wealth Pilot</h1>

      <input
        placeholder="Valor"
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        style={{
          padding: "10px",
          marginTop: "20px",
          width: "200px",
        }}
      />

      <br />
      <br />

      <button
        onClick={salvar}
        style={{
          padding: "10px 20px",
          background: "#2563eb",
          color: "white",
          border: "none",
          borderRadius: "10px",
          cursor: "pointer",
        }}
      >
        Salvar
      </button>
    </div>
  );
}