const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "Meu Município API",
    version: "1.0.0",
    description: "Documentação dos endpoints da API Meu Município",
  },
  servers: [{ url: `${process.env.API_URL || "http://localhost:3000"}/api` }],
  tags: [
    { name: "Health", description: "Verificação de saúde do serviço" },
    { name: "Auth", description: "Autenticação e registro de usuários" },
    { name: "Posts", description: "CRUD de posts e listagens" },
    { name: "Comments", description: "Comentários em posts" },
    { name: "Supports", description: "Apoios (curtir/descurtir) em posts" },
    { name: "Shares", description: "Compartilhamentos de posts" },
    { name: "Locations", description: "Estados e Cidades para cadastro" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      ErrorResponse: {
        type: "object",
        properties: {
          message: { type: "string" },
        },
      },
      AuthRegisterRequest: {
        type: "object",
        required: ["nome", "email", "senha", "id_cidade"],
        properties: {
          nome: { type: "string" },
          email: { type: "string", format: "email" },
          senha: { type: "string" },
          id_cidade: { type: "integer" },
          descricao: { type: "string" },
          media_url: { type: "string" },
        },
      },
      AuthRegisterResponse: {
        type: "object",
        properties: {
          token: { type: "string" },
          user: { type: "object" },
        },
      },
      AuthLoginRequest: {
        type: "object",
        required: ["email", "senha"],
        properties: {
          email: { type: "string", format: "email" },
          senha: { type: "string" },
        },
      },
      AuthLoginResponse: {
        type: "object",
        properties: {
          token: { type: "string" },
          user: { type: "object" },
        },
      },
      PostCreateRequest: {
        type: "object",
        required: [
          "id_categoria",
          "id_cidade",
          "tipo_post",
          "titulo",
          "descricao",
        ],
        properties: {
          id_categoria: { type: "integer" },
          id_cidade: { type: "integer" },
          tipo_post: { type: "string", enum: ["sugestao", "reclamacao"] },
          titulo: { type: "string" },
          descricao: { type: "string" },
          local_latitude: { type: "number", nullable: true },
          local_longitude: { type: "number", nullable: true },
          midias: {
            type: "array",
            items: { type: "string", format: "binary" },
          },
        },
      },
      PostUpdateRequest: {
        type: "object",
        properties: {
          titulo: { type: "string" },
          descricao: { type: "string" },
          status_post: {
            type: "string",
            enum: ["aberto", "em_analise", "resolvido", "arquivado"],
          },
          local_latitude: { type: "number" },
          local_longitude: { type: "number" },
        },
      },
      PostDetailResponse: {
        type: "object",
        properties: {
          post: { type: "object" },
          metrics: {
            type: "object",
            properties: {
              comentarios: { type: "integer" },
              apoios: {
                type: "object",
                properties: {
                  curtir: { type: "integer" },
                  descurtir: { type: "integer" },
                },
              },
              compartilhamentos: { type: "integer" },
            },
          },
        },
      },
      CommentsListResponse: {
        type: "object",
        properties: {
          comentarios: { type: "array", items: { type: "object" } },
          pagination: {
            type: "object",
            properties: {
              page: { type: "integer" },
              limit: { type: "integer" },
              total: { type: "integer" },
            },
          },
        },
      },
      CommentCreateRequest: {
        type: "object",
        required: ["conteudo"],
        properties: {
          conteudo: { type: "string" },
          id_comentario_pai: { type: "integer", nullable: true },
        },
      },
      SupportRequest: {
        type: "object",
        properties: {
          tipo_apoio: { type: "string", enum: ["curtir", "descurtir"] },
        },
      },
      ShareResponse: {
        type: "object",
        properties: {
          message: { type: "string" },
          total_compartilhamentos: { type: "integer" },
          share_url: { type: "string" },
        },
      },
    },
  },
  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Status do serviço",
        responses: {
          200: {
            description: "Serviço operacional",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string" },
                    timestamp: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Registrar usuário",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AuthRegisterRequest" },
            },
          },
        },
        responses: {
          201: {
            description: "Usuário registrado e token gerado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthRegisterResponse" },
              },
            },
          },
          400: {
            description: "Campos obrigatórios ausentes",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          409: {
            description: "E-mail já cadastrado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login de usuário",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AuthLoginRequest" },
            },
          },
        },
        responses: {
          200: {
            description: "Login bem-sucedido",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthLoginResponse" },
              },
            },
          },
          400: {
            description: "Campos obrigatórios ausentes",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          401: {
            description: "Credenciais inválidas",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Perfil do usuário autenticado",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Dados do usuário",
            content: { "application/json": { schema: { type: "object" } } },
          },
          401: {
            description: "Token não fornecido ou inválido",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/posts": {
      get: {
        tags: ["Posts"],
        summary: "Listar posts com filtros e paginação",
        parameters: [
          {
            name: "tipo_post",
            in: "query",
            schema: { type: "string", enum: ["sugestao", "reclamacao"] },
          },
          { name: "id_categoria", in: "query", schema: { type: "integer" } },
          { name: "id_cidade", in: "query", schema: { type: "integer" } },
          {
            name: "page",
            in: "query",
            schema: { type: "integer", default: 1 },
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", default: 10 },
          },
          {
            name: "sort",
            in: "query",
            schema: { type: "string", enum: ["recentes", "populares"] },
          },
        ],
        responses: {
          200: {
            description: "Lista de posts",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    posts: { type: "array", items: { type: "object" } },
                    pagination: { type: "object" },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Posts"],
        summary: "Criar um post com mídias",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: { $ref: "#/components/schemas/PostCreateRequest" },
            },
          },
        },
        responses: {
          201: {
            description: "Post criado com sucesso",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string" },
                    post: { type: "object" },
                  },
                },
              },
            },
          },
          400: {
            description: "Validação falhou",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          401: {
            description: "Não autenticado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/posts/{id}": {
      get: {
        tags: ["Posts"],
        summary: "Detalhes do post com métricas",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          200: {
            description: "Detalhes do post",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/PostDetailResponse" },
              },
            },
          },
          404: {
            description: "Post não encontrado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      put: {
        tags: ["Posts"],
        summary: "Atualizar um post",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/PostUpdateRequest" },
            },
          },
        },
        responses: {
          200: {
            description: "Post atualizado",
            content: { "application/json": { schema: { type: "object" } } },
          },
          400: {
            description: "Validação falhou",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          401: {
            description: "Não autenticado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          403: {
            description: "Sem permissão",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          404: {
            description: "Post não encontrado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Posts"],
        summary: "Deletar um post",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          200: {
            description: "Post deletado",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { message: { type: "string" } },
                },
              },
            },
          },
          401: {
            description: "Não autenticado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          403: {
            description: "Sem permissão",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          404: {
            description: "Post não encontrado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/posts/my/posts": {
      get: {
        tags: ["Posts"],
        summary: "Listar meus posts",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "page",
            in: "query",
            schema: { type: "integer", default: 1 },
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", default: 10 },
          },
        ],
        responses: {
          200: {
            description: "Lista de posts do usuário",
            content: { "application/json": { schema: { type: "object" } } },
          },
          401: {
            description: "Não autenticado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/posts/user/{id_usuario}": {
      get: {
        tags: ["Posts"],
        summary: "Listar posts de um usuário específico",
        parameters: [
          {
            name: "id_usuario",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
          {
            name: "page",
            in: "query",
            schema: { type: "integer", default: 1 },
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", default: 10 },
          },
        ],
        responses: {
          200: {
            description: "Lista de posts do usuário",
            content: { "application/json": { schema: { type: "object" } } },
          },
        },
      },
    },
    "/posts/{id}/comments": {
      get: {
        tags: ["Comments"],
        summary: "Listar comentários do post",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
          {
            name: "page",
            in: "query",
            schema: { type: "integer", default: 1 },
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", default: 10 },
          },
        ],
        responses: {
          200: {
            description: "Lista de comentários",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CommentsListResponse" },
              },
            },
          },
        },
      },
      post: {
        tags: ["Comments"],
        summary: "Adicionar comentário ao post",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CommentCreateRequest" },
            },
          },
        },
        responses: {
          201: {
            description: "Comentário adicionado",
            content: { "application/json": { schema: { type: "object" } } },
          },
          400: {
            description: "Conteúdo inválido",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          401: {
            description: "Não autenticado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          404: {
            description: "Post não encontrado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/posts/{id}/comments/{commentId}": {
      delete: {
        tags: ["Comments"],
        summary: "Remover comentário do post",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
          {
            name: "commentId",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          200: {
            description: "Comentário removido",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { message: { type: "string" } },
                },
              },
            },
          },
          401: {
            description: "Não autenticado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          404: {
            description: "Comentário não encontrado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/posts/{id}/support": {
      post: {
        tags: ["Supports"],
        summary: "Apoiar (curtir/descurtir) um post",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        requestBody: {
          required: false,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SupportRequest" },
            },
          },
        },
        responses: {
          200: {
            description: "Apoio registrado",
            content: { "application/json": { schema: { type: "object" } } },
          },
          401: {
            description: "Não autenticado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          404: {
            description: "Post não encontrado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Supports"],
        summary: "Remover apoio do post",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          200: {
            description: "Apoio removido",
            content: { "application/json": { schema: { type: "object" } } },
          },
          401: {
            description: "Não autenticado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          404: {
            description: "Post não encontrado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/posts/{id}/share": {
      post: {
        tags: ["Shares"],
        summary: "Registrar compartilhamento do post",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          200: {
            description: "Compartilhamento registrado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ShareResponse" },
              },
            },
          },
          401: {
            description: "Não autenticado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          404: {
            description: "Post não encontrado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
  },

  "/locations/estados": {
    get: {
      tags: ["Locations"],
      summary: "Listar estados",
      responses: {
        200: {
          description: "Lista de estados",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  estados: { type: "array", items: { type: "object" } },
                },
              },
            },
          },
        },
      },
    },
  },
  "/locations/cidades": {
    get: {
      tags: ["Locations"],
      summary: "Listar cidades por estado",
      parameters: [
        {
          name: "id_estado",
          in: "query",
          required: true,
          schema: { type: "integer" },
        },
      ],
      responses: {
        200: {
          description: "Lista de cidades",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  cidades: { type: "array", items: { type: "object" } },
                },
              },
            },
          },
        },
        400: {
          description: "id_estado inválido",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
      },
    },
  },
};

module.exports = swaggerDocument;
