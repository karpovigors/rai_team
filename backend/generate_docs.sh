#!/bin/bash

# Скрипт для генерации документации для backend части проекта

echo "Генерация документации для backend части проекта..."

# Создаем директорию для документации, если она не существует
mkdir -p docs/html

echo "Запуск Doxygen..."
doxygen Doxyfile

if [ $? -eq 0 ]; then
    echo "Doxygen успешно выполнен. Результаты сохранены в docs/html"
else
    echo "Ошибка при выполнении Doxygen"
fi

echo "Запуск Sphinx..."
cd docs
make html

if [ $? -eq 0 ]; then
    echo "Sphinx успешно выполнен. Результаты сохранены в docs/_build/html"
else
    echo "Ошибка при выполнении Sphinx"
fi

cd ..

echo "Генерация документации завершена."
echo "Doxygen документация доступна в: docs/html"
echo "Sphinx документация доступна в: docs/_build/html"