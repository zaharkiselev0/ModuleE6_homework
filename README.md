## Установка

1.Выполните в консоли команды:
git clone https://github.com/zaharkiselev0/ModuleE6_homework.git
cd ModuleE6_homework
pip install -r requirements.txt
cd m
python manage.py makemigrations
python manage.py migrate

2.Установить сервер redis.Инструкция для Windows:
Установите WSL (если не установлен):  [Инструкция от Microsoft](https://learn.microsoft.com/ru-ru/windows/wsl/install)
В WSL выполните: sudo apt update && sudo apt install redis-server

## Запуск

1. Запустить WSL и ввести команду redis-server.Не закрывать окно.
2. В консоли, находясь в /ModuleE6_homework/M, ввести:
python manage.py runserver 
3.Фронтенд будет доступен по адресу: http://localhost:8000/app


