# H-System

Este sistema foi desenvolvido para gerenciar uma empresa fictícia dentro do Habbo Hotel, mais especificamente uma organização policial de RPG. Ele tem como objetivo facilitar o controle de diversos aspectos administrativos, como a gestão de funcionários ativos, demitidos, exonerados e advertidos, além de gerenciar permissões de acordo com a hierarquia estabelecida. O sistema também abrange a administração de departamentos, permitindo o armazenamento de documentos e o controle de membros de forma eficaz. É uma solução completa para organizar o funcionamento interno de corporações fictícias dentro do jogo, promovendo uma experiência de roleplay mais estruturada e profissional.


## Variáveis de Ambiente

Para rodar esse projeto, você vai precisar adicionar as seguintes variáveis de ambiente no seu .env

`JWT_SECRET`

`PORT`

`MONGODB_URL`


## Uso

No seu terminal, execute o seguinte comando para iniciar o servidor:

```bash
npm start
```
## Stack utilizada

**Front-end:** Arquivos estáticos

**Back-end:** Node, Express, MongoDB


## Funcionalidades

#### - Gestão de Funcionários:
- Controle detalhado de funcionários ativos, demitidos, exonerados e advertidos, permitindo monitorar o histórico de cada membro da corporação.
#### - Controle de Permissões Hierárquicas e Administrativas:
- Gerenciamento das permissões de acesso e funções dos funcionários com base em sua posição hierárquica dentro da organização. O sistema também controla as permissões administrativas, limitando o acesso a funções críticas a cargos superiores.
#### - Painel de Controle:
- Um painel de controle centralizado, onde administradores podem visualizar e gerenciar facilmente todos os aspectos do sistema, desde funcionários até relatórios e permissões.
#### - Administração de Departamentos:
- Criação e gerenciamento dos diversos departamentos da polícia, com controle de membros de cada setor, facilitando a organização interna.
#### - Armazenamento e Controle de Documentos:
- Armazenamento seguro de documentos importantes de cada departamento, com fácil acesso para membros autorizados, garantindo o gerenciamento eficiente de relatórios e registros.
#### - Relatórios de Atividades:
- Geração de relatórios de atividades dos membros, permitindo um acompanhamento detalhado do desempenho e das ações tomadas por cada funcionário.
Essas funcionalidades tornam o sistema essencial para a administração de uma corporação policial dentro de um ambiente de RPG, promovendo uma gestão mais eficaz e organizada.

