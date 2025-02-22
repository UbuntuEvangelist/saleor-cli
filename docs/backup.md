## `saleor backup` command

```
saleor backup [command]

Commands:
  saleor backup list [key|environment]  List backups of the environment
  saleor backup create <name>           Create a new backup
  saleor backup show [key]              Show a specific backup
  saleor backup remove <key>            Remove the backup
  saleor backup restore [from]          Restore a specific backup

Options:
      --json             Output the data as JSON                       [boolean]
  -u, --instance, --url                                                 [string]
  -V, --version          Show version number                           [boolean]
  -h, --help             Show help                                     [boolean]

```

  saleor backup list [key|environment]  List backups of the environment
  saleor backup create <name>           Create a new backup
  saleor backup show [backup]           Show a specific backup
  saleor backup restore [from]          Restore a specific backup

### saleor backup list

```
saleor backup list [key|environment]

List backups of the environment

Options:
      --json     Output the data as JSON                               [boolean]
  -V, --version  Show version number                                   [boolean]
  -h, --help     Show help                                             [boolean]
```

### saleor backup create

```
saleor backup create <name>

Create a new backup

Positionals:
  name  name for the new backup                              [string] [required]

Options:
      --json     Output the data as JSON                               [boolean]
  -V, --version  Show version number                                   [boolean]
  -h, --help     Show help                                             [boolean]
```

### saleor backup show

```
saleor backup show [backup|backup-key]

Show a specific backup

Options:
      --json             Output the data as JSON                       [boolean]
  -u, --instance, --url                                                 [string]
  -V, --version          Show version number                           [boolean]
  -h, --help             Show help                                     [boolean]
```

### saleor backup remove

```
saleor backup remove <key>

Remove the backup

Positionals:
  key  key of the backup                                     [string] [required]

Options:
      --json             Output the data as JSON                       [boolean]
  -u, --instance, --url                                                 [string]
      --force            skip confirmation prompt                      [boolean]
  -V, --version          Show version number                           [boolean]
  -h, --help             Show help                                     [boolean]
```

### saleor backup restore

```
saleor backup restore [from]

Restore a specific backup

Options:
      --json                  Output the data as JSON                  [boolean]
      --from                  key of the snapshot                       [string]
      --skip-webhooks-update  skip webhooks update prompt              [boolean]
  -V, --version               Show version number                      [boolean]
  -h, --help                  Show help                                [boolean]
```