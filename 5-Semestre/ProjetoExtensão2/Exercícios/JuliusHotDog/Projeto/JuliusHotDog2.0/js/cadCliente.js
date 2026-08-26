document.getElementById("formCadastro").addEventListener("submit", async function (e) {
  e.preventDefault();

  const nome = document.getElementById("nome").value;
  const telefone = document.getElementById("telefone").value;

  try {
    const response = await fetch("http://127.0.0.1:8000/clientes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        nome: nome,
        telefone: telefone
      })
    });

    if (response.ok) {
      alert("Cadastro realizado com sucesso!");
      
      // 🔥 REDIRECIONA PARA LOGIN
      window.location.href = "/login.html";
    } else {
      alert("Erro ao cadastrar.");
    }

  } catch (error) {
    console.error("Erro:", error);
    alert("Erro de conexão com o servidor.");
  }
});