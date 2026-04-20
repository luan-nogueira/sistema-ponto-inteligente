# Sistema de Ponto Inteligente - TODO

## Fase 1: Estrutura Base e Banco de Dados
- [x] Modelar schema do banco (usuários, registros de ponto, justificativas, configurações, empresas)
- [x] Criar migrações do banco de dados
- [x] Implementar helpers de query no server/db.ts
- [x] Criar tipos TypeScript para entidades principais

## Fase 2: Autenticação e Controle de Acesso
- [x] Implementar autenticação com OAuth/Manus
- [x] Criar sistema de roles (admin/gestor/colaborador)
- [x] Implementar protectedProcedure com validação de role
- [x] Criar middleware de autorização
- [x] Tela de login responsiva

## Fase 3: Layout Base e Componentes
- [x] Criar DashboardLayout com sidebar responsiva
- [x] Implementar tema claro/escuro
- [x] Criar componentes reutilizáveis (cards, tabelas, modais)
- [x] Implementar navegação por role
- [x] Responsividade mobile-first

## Fase 4: Painel do Colaborador - Parte 1
- [x] Dashboard com resumo do dia (status atual, horas trabalhadas)
- [ ] Componente de registro de ponto (entrada, saída, intervalo)
- [ ] Integração com Geolocation API
- [ ] Captura de latitude/longitude no registro
- [x] Validação de sequência correta (entrada → intervalo → saída)
- [ ] Confirmação visual após registro

## Fase 5: Painel do Colaborador - Parte 2
- [x] Histórico de registros com filtros
- [x] Resumo mensal (dias trabalhados, atrasos, horas extras, faltas)
- [x] Sistema de justificativas (solicitar ajuste)
- [ ] Perfil do colaborador
- [ ] Visualização de observações e status

## Fase 6: Painel do Gestor - Parte 1
- [x] Dashboard administrativo com métricas gerais
- [x] Listagem de colaboradores com status em tempo real
- [x] Filtros (nome, setor, cargo, status)
- [x] Indicadores visuais de presença/ausência/atraso
- [x] Busca e paginação

## Fase 7: Painel do Gestor - Parte 2
- [ ] Gestão de colaboradores (criar, editar, bloquear, excluir)
- [ ] Definição de cargo, setor, jornada e escala
- [x] Visualização de registros em tempo real
- [x] Detalhes de cada registro (colaborador, horário, tipo, localização)
- [x] Aprovação/rejeição de justificativas

## Fase 8: Mapa e Geolocalização
- [ ] Integração com Google Maps
- [ ] Exibição de localização das batidas de ponto
- [ ] Visualização de precisão da localização
- [ ] Mapa com ponto da empresa e ponto registrado
- [ ] Validação de área permitida (raio)

## Fase 9: Relatórios e Exportação
- [ ] Relatórios de ponto por colaborador
- [ ] Filtros por período
- [ ] Exportação em PDF
- [ ] Exportação em Excel
- [ ] Gráficos de atrasos, faltas, horas extras
- [ ] Espelho de ponto mensal

## Fase 10: Configurações da Empresa
- [ ] Definição de horários de trabalho
- [ ] Tolerância para atraso
- [ ] Regras de intervalo
- [ ] Cadastro de feriados
- [ ] Raio permitido para bater ponto
- [ ] Cadastro de unidades/locais
- [ ] Geofencing (cercas virtuais)

## Fase 11: Dados de Exemplo e Testes
- [ ] Popular banco com dados de exemplo
- [ ] Criar usuários de teste (colaborador, gestor, admin)
- [ ] Criar registros de ponto de exemplo
- [ ] Criar justificativas de exemplo
- [x] Testes unitários com vitest (15 testes passando)

## Fase 12: Ajustes Finais e Entrega
- [x] Validação de UX/UI básica
- [x] Testes de responsividade (sidebar responsivo, mobile-first)
- [ ] Otimizações de performance
- [ ] Documentação de uso
- [ ] Checkpoint final e entrega
