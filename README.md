# 🏢 Portal de Agendamento do Auditório - Eletromidia

Sistema completo e responsivo para gestão, solicitação e operação do auditório da **Eletromidia**. O portal separa a experiência em uma interface de consulta e reserva para colaboradores comuns e uma **Área do Operador** restrita com credenciais para as equipes do C.O. (Centro de Operações), TI/AV e Diretoria.

---

## 🚀 Principais Funcionalidades

### 👥 1. Visão do Colaborador (Pública)
- **Calendário do Auditório**: Visualização em lista de cards e em **Grid Mensal**.
- **Filtros Rápidos**: Filtragem por eventos com mídia C.O., clientes específicos e compromissos do dia.
- **Detecção de Conflito de Horário**: Alerta automático em tempo real caso já exista uma reserva no mesmo dia e intervalo de horário, evitando reservas sobrepostas.
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
- **Bot de Notificação no Slack (Audiovisual)**: Disparo automático de cards no canal do Slack da equipe de audiovisual com detalhes de novas reservas.
- **Confirmação por E-mail (EmailJS)**: Disparo de e-mail automático para o solicitante com o comprovante de agendamento.
- **Backend em Nuvem (Supabase)**: Sincronização em tempo real entre todos os computadores.
- **Google Agenda Sync**: Botão **+ Google Agenda** em cada evento para sincronização instantânea de título, horário, local e ficha técnica no Google Agenda institucional.
- **Exportação iCal (`.ics`)**: Download de arquivos `.ics` para importar em qualquer cliente de calendário.
- **Aba Fichas Técnicas (C.O. & AV)**: Visão detalhada de todas as especificações técnicas de cada evento com opção de **Imprimir Ficha/Relatório em PDF**.
- **Gestão de Reservas**: Opção para cancelar/excluir agendamentos ativos.

---

## 💬 Como Configurar o Bot de Notificações no Slack

Para que o canal do Slack da equipe de audiovisual receba mensagens automáticas a cada novo agendamento:

1. Acesse o portal de apps do Slack: [api.slack.com/apps](https://api.slack.com/apps).
2. Clique em **Create New App** -> Selecione **From scratch**.
3. Dê um nome para o app (ex: `Robô Auditório Eletromidia`) e selecione o workspace da **Eletromidia**.
4. No menu lateral, clique em **Incoming Webhooks** e ative a chave para **On**.
5. Clique no botão **Add New Webhook to Workspace** no final da página.
6. Escolha o **canal da equipe de audiovisual** e clique em **Allow** (Permitir).
7. Copie o **Webhook URL** gerado (parece com: `https://hooks.slack.com/services/T.../B.../...`).
8. No site do Auditório, faça login na **Área do Operador**, acesse a aba **Integrações & Nuvem**, cole a URL no campo **Slack Webhook URL** e clique em **Salvar Todas as Configurações** (você pode clicar no botão **Testar Slack** para verificar o envio da mensagem).

---

## ☁️ Como Configurar o Banco de Dados em Nuvem (Supabase)

1. Crie uma conta gratuita no [supabase.com](https://supabase.com) e crie um novo projeto.
2. No **SQL Editor** do Supabase, execute o seguinte comando para criar a tabela:
```sql
create table auditorio_events (
  id text primary key,
  title text,
  "applicantName" text,
  "applicantEmail" text,
  "applicantPhone" text,
  department text,
  date text,
  "startTime" text,
  "endTime" text,
  "setupBuffer" text,
  "eventType" text,
  "hasSpecificClient" boolean,
  "clientName" text,
  "hasCOMedia" boolean,
  "coMediaType" text,
  "coMediaFormat" text,
  "coMediaUrl" text,
  "coTestNeeded" text,
  "coTestDatetime" text,
  "coInstructions" text,
  "numPresentations" int,
  "presentationFormat" text,
  "presentationDevice" text,
  "numPresenters" int,
  "micsHandheld" int,
  "micsLapel" int,
  "micsAudience" int,
  "stageLayout" text,
  "streamingType" text,
  "needPassador" boolean,
  "needStageMonitor" boolean,
  "needTISupport" boolean,
  "numAttendees" int,
  "numExternalGuests" int,
  "hasCatering" text,
  "cateringTime" text,
  "logisticsNotes" text
);

-- Habilitar leitura e escrita pública/anônima
alter table auditorio_events enable row level security;
create policy "Allow all access" on auditorio_events for all using (true) with check (true);
```
3. Em **Project Settings** -> **API**, copie o **Project URL** e a **Anon Key**.
4. Cole esses valores na aba **Integrações & Nuvem** da Área do Operador no site e clique em **Salvar**.

---

## 💻 Como Executar Localmente

1. Baixe ou clone o repositório em sua máquina.
2. Abra o arquivo `index.html` diretamente em qualquer navegador moderno (Chrome, Edge, Firefox, Safari).

---

## 🌐 Como Subir no GitHub & Ativar o GitHub Pages

1. Inicialize o Git e envie os arquivos para o seu repositório:
   ```bash
   git add .
   git commit -m "Versao final com Slack, Conflito de Horario e Nuvem"
   git push origin main
   ```
2. No GitHub, acesse seu repositório -> **Settings** -> **Pages**.
3. Em **Source**, selecione a branch `main` e a pasta `/ (root)`.
4. Clique em **Save**.

---

© 2026 Eletromidia — Todos os direitos reservados.
