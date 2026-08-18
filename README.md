# Cadastro de Usuários — CRUD

Aplicação web para gerenciamento de usuários, desenvolvida como atividade prática de consolidação das disciplinas de Front-end, Back-end e Banco de Dados.

## Tecnologias utilizadas

**Back-end**
- Java 21
- Spring Boot 4.1.0
- Spring Data JPA (Hibernate)
- Spring Validation
- Maven

**Front-end**
- HTML5
- CSS3 (layout responsivo)
- JavaScript (Fetch API)

**Banco de Dados**
- PostgreSQL 17

## Estrutura da aplicação

    crud-usuarios/
    ├── backend/                  # API REST em Spring Boot
    │   └── src/main/java/com/kaua/backend/
    │       ├── controller/       # Endpoints REST e códigos HTTP
    │       ├── service/          # Regras de negócio
    │       ├── repository/       # Acesso ao banco de dados
    │       ├── model/            # Entidade JPA
    │       ├── dto/              # Objetos de entrada e validações
    │       └── exception/        # Exceções e tratamento global de erros
    ├── frontend/                 # Interface web
    │   ├── index.html
    │   ├── style.css
    │   └── script.js
    ├── database/
    │   └── criar_banco.sql       # Script de criação da tabela
    └── README.md

## Como executar o projeto

### 1. Banco de dados

Criar o banco e executar o script da tabela:

    psql -U postgres -c "CREATE DATABASE crud_usuarios;"
    psql -U postgres -d crud_usuarios -f database/criar_banco.sql

### 2. Back-end

Ajustar as credenciais do banco em `backend/src/main/resources/application.properties` e executar a classe `BackendApplication`.

A API ficará disponível em `http://localhost:8080`.

### 3. Front-end

Abrir o arquivo `frontend/index.html` no navegador.

## Endpoints da API

| Método | Rota | Descrição | Status de sucesso |
|--------|------|-----------|-------------------|
| GET | /api/usuarios | Lista todos os usuários | 200 OK |
| GET | /api/usuarios/{id} | Consulta por ID | 200 OK |
| POST | /api/usuarios | Cadastra usuário | 201 Created |
| PUT | /api/usuarios/{id} | Atualiza usuário | 200 OK |
| DELETE | /api/usuarios/{id} | Exclui usuário | 204 No Content |

### Tratamento de erros

| Situação | Status |
|----------|--------|
| Campos obrigatórios inválidos | 400 Bad Request |
| Usuário não encontrado | 404 Not Found |
| CPF ou e-mail já cadastrado | 409 Conflict |

## Modelo de dados

Tabela `usuarios`:

| Campo | Tipo | Restrições |
|-------|------|------------|
| id | BIGSERIAL | PRIMARY KEY |
| nome | VARCHAR(50) | NOT NULL |
| cpf | VARCHAR(11) | NOT NULL, UNIQUE |
| email | VARCHAR(80) | NOT NULL, UNIQUE |
| telefone | VARCHAR(16) | NOT NULL |
| data_nascimento | DATE | NOT NULL |
| data_cadastro | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP |

## Autor

Kauã Lisboa Emerencio
