# Versioned Tasks

As tasks do projeto sao organizadas por versao do plugin.

```text
tasks/
  v1.0/
    TASKS.md
  v1.1/
    TASKS.md
```

Ao iniciar uma nova versao:

1. Crie `tasks/vX.Y/TASKS.md`.
2. Declare o objetivo da versao.
3. Use IDs `GDUI-*` unicos.
4. Marque features novas como `Planned` ate terem implementacao, exemplo e teste.
5. Atualize o indice raiz `TASKS.md`.

Nenhuma feature nova deve viver apenas em comentario, README ou issue solta.

