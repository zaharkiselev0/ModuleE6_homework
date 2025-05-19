## Установка

1.Выполните в консоли команды:
git clone https://github.com/zaharkiselev0/ModuleE6_homework.git <br />
cd ModuleE6_homework <br />
pip install -r requirements.txt <br />
cd m <br />
python manage.py makemigrations <br />
python manage.py migrate <br />

2.Установить сервер redis. Инструкция для Windows: <br />
2.1Установите WSL (если не установлен):  [Инструкция от Microsoft](https://learn.microsoft.com/ru-ru/windows/wsl/install)
2.2 В WSL выполните: <br />
sudo apt update && sudo apt install redis-server

## Запуск

1. Запустить WSL и ввести команду redis-server.Не закрывать окно. <br />
2. В консоли, находясь в /ModuleE6_homework/M, ввести: <br />
python manage.py runserver  <br />
3. Фронтенд будет доступен по адресу: http://localhost:8000/app 


