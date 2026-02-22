import React from 'react';
import '../../AuthPage/ui/AuthPage.css';
import '../../ProfilePage/ui/ProfilePage.css';

export const LearningPage: React.FC = () => {
  return (
    <div className="auth-page">
      <header className="auth-header">
        <h1>
          <a href="/" className="auth-header-link">
            Информационно-навигационная платформа для людей с нарушением слуха
          </a>
        </h1>
      </header>
      <main className="auth-main">
        {/* Отдельная страница для пункта 4 кейса: обучение и развитие навыков. */}
        <section className="push-section learning-section">
          <h2>Обучение и развитие коммуникационных навыков</h2>
          <p className="push-hint">
            Полезные инструкции и советы по развитию коммуникативных способностей
            (видеоуроки, курсы изучения русского жестового языка, практические занятия).
          </p>
          <div className="learning-cards">
            <article className="learning-card">
              <h4>Русский жестовый язык (РЖЯ)</h4>
              <p>Подборка бесплатных видеоуроков и практик для базового общения и навигации.</p>
              <ul>
                <li>Базовые фразы в общественных местах</li>
                <li>Жесты для транспорта и маршрутов</li>
                <li>Жесты для общения в учреждениях</li>
              </ul>
            </article>
            <article className="learning-card">
              <h4>Навигация и безопасность</h4>
              <p>Краткие инструкции для планирования маршрута с учетом доступности среды.</p>
              <ul>
                <li>Проверяйте наличие субтитров и доступной среды заранее</li>
                <li>Используйте карточку объекта и кнопку «Проложить маршрут»</li>
                <li>Оставляйте отзывы и предупреждения для других пользователей</li>
              </ul>
            </article>
            <article className="learning-card">
              <h4>Коммуникационные подсказки</h4>
              <p>Практические советы для общения в кинотеатрах, музеях, МФЦ и поликлиниках.</p>
              <ul>
                <li>Показывайте текстовые запросы на экране телефона</li>
                <li>Уточняйте наличие визуальных оповещений</li>
                <li>Сообщайте о найденных элементах доступности в карточке места</li>
              </ul>
            </article>
          </div>
        </section>
      </main>
      <footer className="auth-footer"></footer>
    </div>
  );
};
