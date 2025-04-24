# Инструкция по копированию проекта nsrz-connect на GitHub

## Шаг 1: Инициализировать Git в проекте (если это еще не сделано)

```bash
# Перейдите в корневую директорию вашего проекта
cd /Users/mac/nsrz-connect

# Инициализируйте Git, если папки .git еще нет
git init
```

## Шаг 2: Настройка Git (если не настроено)

```bash
# Установите ваше имя и email
git config --global user.name "uniov"
git config --global user.email "ваш_email@example.com"
```

## Шаг 3: Создание репозитория на GitHub

1. Перейдите на [GitHub](https://github.com)
2. Войдите в свой аккаунт (username: uniov)
3. Нажмите "+" в правом верхнем углу и выберите "New repository"
4. Введите имя репозитория: "nsrz-connect"
5. Можете добавить описание (не обязательно)
6. Оставьте репозиторий публичным или выберите приватный (по желанию)
7. НЕ инициализируйте репозиторий с README, .gitignore или лицензией
8. Нажмите "Create repository"

## Шаг 4: Подготовка локального репозитория

```bash
# Добавьте все файлы в область подготовки
git add .

# Создайте первый коммит
git commit -m "Initial commit"
```

## Шаг 5: Исправление ошибки push и отправка кода на GitHub

Если вы получили ошибку "src refspec main does not match any", выполните следующие шаги:

```bash
# Проверьте, какая у вас основная ветка
git branch

# Если ветки не видно, создайте ветку main и переключитесь на нее
git checkout -b main

# Или если у вас есть ветка master, но нет main:
# git branch -M main

# Добавьте удаленный репозиторий
git remote add origin https://github.com/uniov/nsrz-connect.git

# Для работы через SSH используйте:
# git remote add origin git@github.com:uniov/nsrz-connect.git

# Отправьте код в ветку main
git push -u origin main
```

## Если проблема все еще не решена:

Если у вас по-прежнему возникает ошибка, попробуйте следующее:

```bash
# Проверьте, есть ли у вас коммиты
git log

# Если коммитов нет (пустой репозиторий), создайте пустой коммит
git commit --allow-empty -m "Initial empty commit"

# Затем снова попробуйте отправить
git push -u origin main
```

## Настройка аутентификации (если необходимо)

Для работы с GitHub вам понадобится настроить аутентификацию:

1. **Для HTTPS**: Используйте Personal Access Token (PAT)
   - Перейдите в Settings > Developer settings > Personal access tokens
   - Создайте токен с правами на репозиторий
   - Используйте этот токен вместо пароля при запросе

2. **Для SSH**: Настройте SSH ключ
   ```bash
   # Генерация SSH ключа
   ssh-keygen -t ed25519 -C "ваш_email@example.com"
   
   # Запустите ssh-agent
   eval "$(ssh-agent -s)"
   
   # Добавьте ключ в ssh-agent
   ssh-add ~/.ssh/id_ed25519
   
   # Скопируйте публичный ключ и добавьте его на GitHub в Settings > SSH and GPG keys
   cat ~/.ssh/id_ed25519.pub
   ```

## Примечание

После успешного выполнения этих шагов, ваш проект `nsrz-connect` будет доступен на GitHub по адресу:
https://github.com/uniov/nsrz-connect 