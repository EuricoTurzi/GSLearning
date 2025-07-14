# GSLearning - Prompt Padrão de Trabalho

**INSTRUÇÕES OBRIGATÓRIAS:** Este prompt deve ser seguido rigorosamente em todas as interações relacionadas ao projeto GSLearning.

## Metodologia de Desenvolvimento

### 1. Verificação de Atualizações
- **SEMPRE** verificar atualizações do projeto no GitHub antes de iniciar qualquer modificação
- Consultar o repositório para mudanças recentes que possam impactar o desenvolvimento

### 2. Padrão de Atualização do CHANGELOG
Para cada modificação, adicionar entrada no CHANGELOG seguindo **exatamente** este formato:

```
## YYYY-MM-DD HH:MM
- Página atualizada: [Nome da página/interface]
- Arquivo: [caminho/do/arquivo.extensão] - [Função/Classe específica se aplicável]
- Status: [Iniciando atualização/Em desenvolvimento/Concluído]
```

**Exemplo:**
```
## 2025-07-11 14:45
- Página atualizada: Lista de equipamentos do cliente
- Arquivo: equipment/templates/equipment/client_list.html
- Status: Iniciando atualização
```

### 3. Sequência de Atualização UI/UX
Para modificações de interface, seguir **rigorosamente** esta ordem:

1. **HTML** (Template)
   - **OBRIGATÓRIO:** Usar base.html como template base (já contém header, footer e estrutura predefinida)
   - Aplicar modificações no template
   - Testar e corrigir erros identificados
   - Usar padrão de identificação no topo do arquivo

2. **Views** (Se necessário)
   - Modificar views apenas se identificado erro no HTML
   - Corrigir lógica backend necessária

3. **CSS**
   - Atualizar estilos seguindo padrão do projeto
   - **REFERÊNCIA OBRIGATÓRIA:** Dashboard (arquivos dashboard.html, dashboard.css, dashboard.js)
   - Os 3 arquivos denominados "dashboard" são o MODELO DE DESIGN do projeto
   - Manter consistência visual com este padrão

4. **JavaScript** (Se necessário)
   - Implementar funcionalidades interativas
   - Seguir padrão estabelecido no dashboard.js
   - Apenas após HTML e CSS estarem funcionais

### 4. Padrão de Identificação de Arquivos
**OBRIGATÓRIO:** Todo arquivo deve ter no topo o comentário de identificação:

```html
<!-- GSLEARNING - templates/certificates/verify.html -->
```

**Formato:** `<!-- GSLEARNING - [caminho/completo/do/arquivo.extensão] -->`

### 5. Regra de Atualização Unitária
- **UM ARTEFATO POR VEZ**
- Não sobrecarregar o chat com múltiplas atualizações
- Aguardar aprovação antes de prosseguir para próximo arquivo

## Estrutura de Prompt Eficaz

### Para Atualizações de Interface:
```
Preciso atualizar a interface [nome da página] no projeto GSLearning.

Contexto:
- Página: [nome da página/interface]
- Arquivo atual: [caminho/do/arquivo]
- Resultado esperado: [comportamento/aparência desejada]

Seguir metodologia:
1. Verificar atualizações no GitHub
2. Atualizar CHANGELOG (página atualizada)
3. Usar base.html como template base
4. Seguir padrão dos arquivos dashboard (dashboard.html, dashboard.css, dashboard.js)
5. Aplicar padrão de identificação no topo

Aguardar aprovação antes de prosseguir para próximo arquivo.
```

### Para Correções Backend:
```
Preciso corrigir [funcionalidade específica] no backend do GSLearning.

Contexto:
- Arquivo: [caminho/arquivo.py]
- Classe/Função: [nome específico]
- Problema: [descrição técnica detalhada]
- Comportamento atual: [o que acontece]
- Comportamento esperado: [o que deveria acontecer]

Seguir metodologia:
1. Verificar atualizações no GitHub
2. Atualizar CHANGELOG
3. Aplicar correção específica
4. Adicionar padrão de identificação
```

### Para Análise de Código:
```
Preciso analisar [componente/funcionalidade] no GSLearning.

Análise solicitada:
- Arquivo(s): [lista de arquivos]
- Foco: [aspecto específico - performance, segurança, lógica]
- Contexto: [informações relevantes]

Fornecer:
1. Análise detalhada step-by-step
2. Problemas identificados
3. Sugestões de melhoria
4. Priorização de correções
```

## Confirmação de Entendimento

Ao receber este prompt, confirme que:
- ✅ Entendi a metodologia obrigatória do projeto GSLearning
- ✅ Seguirei a sequência HTML → Views → CSS → JS para UI/UX
- ✅ Atualizarei o CHANGELOG com formato específico
- ✅ Usarei identificação padrão em todos os arquivos
- ✅ Trabalharei com um artefato por vez
- ✅ Verificarei GitHub antes de modificações
- ✅ Usarei base.html como template base obrigatório
- ✅ Seguirei os 3 arquivos dashboard como modelo de design
- ✅ Atualizarei CHANGELOG com "Página atualizada" ao invés de "Problema identificado"

**Resposta esperada:** "Confirmado! Metodologia GSLearning compreendida e será seguida rigorosamente."

## Exemplo de Workflow Completo

1. **Verificação:** "Vou verificar as atualizações do projeto no GitHub"
2. **CHANGELOG:** Adicionar entrada com "Página atualizada: [nome da página]"
3. **HTML:** Usar base.html como template, aplicar identificação no topo
4. **Teste:** Verificar funcionamento
5. **CSS:** Ajustar estilos seguindo padrão dashboard (dashboard.html, dashboard.css, dashboard.js)
6. **JS:** Implementar interatividade seguindo dashboard.js (se necessário)
7. **Finalização:** Confirmar conclusão antes de próximo arquivo