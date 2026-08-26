# 🏢 Portal de Agendamento do Auditório - Eletromidia

Sistema completo e responsivo para gestão, solicitação e operação do auditório da **Eletromidia**. O portal separa a experiência em uma interface de consulta e reserva para colaboradores comuns e uma **Área do Operador** restrita com credenciais para as equipes do C.O. (Centro de Operações), TI/AV e Diretoria.

---

## 🚀 Principais Funcionalidades

### 👥 1. Visão do Colaborador (Pública)
- **Calendário do Auditório**: Visualização em lista de cards e em **Grid Mensal**.
- **Filtros Rápidos**: Filtragem por eventos com mídia C.O., clientes específicos e compromissos do dia.
- **Resumo de Eventos**: Consulta limpa com informações básicas (Título, Solicitante, Departamento, Data e Horário) sem expor links internos ou especificações do C.O.
- **Formulário Passo a Passo de Reserva**:
  1. **Dados Gerais**: Título, solicitante, e-mail, departamento, data, horário e buffer de setup.
  2. **Mídia & C.O.**: Questionário de marcas de clientes, formatos de videowall (16:9, 4K, etc.), links de download de artes e requisição de teste prévio.
  3. **Técnico AV & Palco**: Quantidade de apresentações, notebook utilizado, número de microfones (mão, lapela, plateia), layout do palco e tipo de transmissão (Teams, Zoom, Live).
  4. **Logística & Catering**: Quantidade de participantes/visitantes externos, coffee break e observações para recepção/portaria.

---

### 🛡️ 2. Área do Operador (Restrita com Senha)
Acesso exclusivo através do botão **Área do Operador** no topo do site.

- **Credenciais Padrão de Operador / Admin**:
  - **Login:** `Diretor`
  - **Senha:** `ELT@Estudio`

#### Recursos Exclusivos do Operador:
- **Google Agenda Sync**: Botão **+ Google Agenda** em cada evento para sincronização instantânea de título, horário, local e ficha técnica no Google Agenda institucional.
- **Exportação iCal (`.ics`)**: Download de arquivos `.ics` para importar em qualquer cliente de calendário.
- **Aba Fichas Técnicas (C.O. & AV)**: Visão detalhada de todas as especificações técnicas de cada evento com opção de **Imprimir Ficha/Relatório em PDF**.
- **Aba Google Agenda API**: Configuração do feed iCal WebCal e chaves de integração via OAuth2.
- **Gestão de Reservas**: Opção para cancelar/excluir agendamentos ativos.

---

## 🛠️ Tecnologias Utilizadas

- **HTML5 Semantic**: Estrutura acessível e otimizada.
- **Tailwind CSS (via CDN)**: Estilização moderna no padrão de cores da Eletromidia (Preto `#000000` & Laranja `#FF5500`).
- **JavaScript Vanilla (ES6+)**: Lógica de interface, manipulação de estado e normalização de dados sem dependência de frameworks complexos.
- **Lucide Icons**: Biblioteca leve e elegante de ícones vetoriais.
- **LocalStorage**: Persistência de agendamentos diretamente no navegador.

---

## 📁 Estrutura de Arquivos

```
/
├── index.html        # Estrutura principal da página, navegação, abas e modais
├── styles.css        # Animações personalizadas e estilização complementar
├── app.js            # Lógica de controle, estado, validação e sincronização
├── logo.png          # Logo institucional da Eletromidia (opcional / fallback SVG)
└── README.md         # Documentação completa do projeto
```

---

## 💻 Como Executar Localmente

1. Baixe ou clone o repositório em sua máquina.
2. Abra o arquivo `index.html` diretamente em qualquer navegador moderno (Chrome, Edge, Firefox, Safari) ou utilize a extensão **Live Server** do VS Code.

---

## 🌐 Como Subir no GitHub & Ativar o GitHub Pages

1. Inicialize o Git e envie os arquivos para o seu repositório:
   ```bash
   git add .
   git commit -m "Versao final do Portal de Agendamento do Auditorio Eletromidia"
   git push origin main
   ```
2. No GitHub, acesse seu repositório -> **Settings** -> **Pages**.
3. Em **Source**, selecione a branch `main` e a pasta `/ (root)`.
4. Clique em **Save**. O site estará no ar gratuitamente em alguns minutos!

---

## 💡 Sugestões de Melhorias Futuras

Caso queira expandir o sistema no futuro, aqui estão algumas recomendações valiosas:

1. **Notificações via e-mail / Webhook**:
   - Integrar um webhook do **Microsoft Teams** ou **Slack** para que o canal do C.O. receba uma mensagem automática sempre que uma nova reserva for solicitada.
2. **Validação Automática de Conflito de Horário**:
   - Bloquear automaticamente o formulário de reserva caso já exista um evento confirmado no mesmo dia e intervalo de horário.
3. **Backend com Banco de Dados (Node.js / Firebase / Supabase)**:
   - Migrar do LocalStorage para um banco de dados em nuvem, permitindo que colaboradores em diferentes computadores vejam as atualizações em tempo real.
4. **Envio Automático de Convite por E-mail**:
   - Disparo automático de e-mail de confirmação em HTML para o solicitante com o resumo da reserva e um anexo `.ics`.

---

© 2026 Eletromidia — Todos os direitos reservados.
