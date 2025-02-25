# Unifor Maps - Frontend

Este projeto é a interface web do Unifor Maps, um sistema de mapeamento interno para a Universidade de Fortaleza.

## Clonando o Repositório

Para começar, clone este repositório para sua máquina local:

```sh
git clone https://github.com/seu-usuario/unifor-maps-front.git
cd unifor-maps-front
```

## Executando a Aplicação

Este projeto utiliza apenas HTML, CSS e JavaScript puro. Para rodá-lo, basta abrir o arquivo `index.html` em um navegador ou utilizar o Live Server.

Se estiver utilizando o VS Code, você pode instalar a extensão Live Server e rodar o projeto com um clique com o botão direito no `index.html` e selecionando `Open with Live Server`.

A aplicação estará disponível em `http://127.0.0.1:5500/` ou similar, dependendo da configuração do Live Server.

## Configurando CORS na API

Se a API estiver em um domínio diferente, certifique-se de que o CORS está configurado corretamente no backend.

Caso precise configurar manualmente no front-end, utilize a seguinte configuração ao fazer requisições:

```js
fetch("http://localhost:8000/api/marcadores", {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*"
  }
})
```

## Configuração de Variáveis de Ambiente

Caso precise configurar uma URL de API fixa, crie um arquivo `config.js` e adicione:

```js
const API_URL = "http://localhost:8000/api";
```

No código, use:

```js
fetch(`${API_URL}/marcadores`)
  .then(response => response.json())
  .then(data => console.log(data));
```

## Contribuição

Sinta-se à vontade para abrir issues ou pull requests para melhorias no projeto.

