import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import UsersEditor from '../components/UsersEditor';
import { createUser, updateUser } from '../api/usersApi';
import { getDepartments } from '../api/departmentsApi';

// Мокаем зависимости
jest.mock('../api/usersApi', () => ({
  createUser: jest.fn(),
  updateUser: jest.fn()
}));

jest.mock('../api/departmentsApi', () => ({
  getDepartments: jest.fn()
}));

// Включаем подробное логирование для тестов
const logTestStep = (message) => {
  console.log('\n📝 ' + message);
};

describe('UsersEditor компонент', () => {
  // Типовые пропсы для компонента
  const mockProps = {
    onSave: jest.fn(),
    onCancel: jest.fn()
  };

  const mockDepartments = [
    { id: 1, name: 'ИТ отдел', fullname: 'Отдел информационных технологий' },
    { id: 2, name: 'Бухгалтерия', fullname: 'Бухгалтерский отдел' }
  ];

  // Вывод информации перед всеми тестами
  beforeAll(() => {
    console.log('\n🔍 НАЧАЛО ТЕСТИРОВАНИЯ КОМПОНЕНТА USERSEDITOR');
    console.log('===========================================');
  });

  // Вывод информации после всех тестов
  afterAll(() => {
    console.log('\n✅ ТЕСТИРОВАНИЕ КОМПОНЕНТА USERSEDITOR ЗАВЕРШЕНО');
    console.log('=================================================');
  });

  // Сбрасываем моки перед каждым тестом
  beforeEach(() => {
    jest.clearAllMocks();
    getDepartments.mockResolvedValue(mockDepartments);
    console.log('\n▶️ Начинаем новый тест');
  });

  afterEach(() => {
    console.log('⏹️ Тест завершен\n');
  });

  test('отображает форму создания нового пользователя', async () => {
    logTestStep('Тест: Отображение формы создания нового пользователя');
    
    logTestStep('Рендерим компонент');
    render(<UsersEditor {...mockProps} />);
    
    logTestStep('Проверяем заголовок');
    expect(screen.getByText('Пользователь (создание)')).toBeInTheDocument();
    console.log('✓ Заголовок формы корректен');
    
    logTestStep('Проверяем наличие полей формы');
    expect(screen.getByLabelText(/Фамилия:/i)).toBeInTheDocument();
    console.log('✓ Поле "Фамилия" найдено');
    
    expect(screen.getByLabelText(/Имя:/i)).toBeInTheDocument();
    console.log('✓ Поле "Имя" найдено');
    
    expect(screen.getByLabelText(/Отчество:/i)).toBeInTheDocument();
    console.log('✓ Поле "Отчество" найдено');
    
    expect(screen.getByLabelText(/Email:/i)).toBeInTheDocument();
    console.log('✓ Поле "Email" найдено');
    
    expect(screen.getByLabelText(/Пароль:/i)).toBeInTheDocument();
    console.log('✓ Поле "Пароль" найдено');
    
    logTestStep('Ждем загрузки отделов');
    await waitFor(() => {
      expect(getDepartments).toHaveBeenCalledTimes(1);
    });
    console.log('✓ API getDepartments был вызван');
  });

  test('отображает форму редактирования существующего пользователя', async () => {
    logTestStep('Тест: Отображение формы редактирования существующего пользователя');
    
    const existingUser = {
      id: 1,
      lastname: 'Иванов',
      firstname: 'Иван',
      midlename: 'Иванович',
      email: 'ivanov@example.com',
      role: 'user',
      status: 'active',
      department: 'ИТ отдел'
    };
    
    logTestStep('Рендерим компонент с данными существующего пользователя');
    console.log('Пользователь:', JSON.stringify(existingUser, null, 2));
    render(<UsersEditor user={existingUser} {...mockProps} />);
    
    logTestStep('Проверяем заголовок');
    expect(screen.getByText('Пользователь (редактирование)')).toBeInTheDocument();
    console.log('✓ Заголовок формы корректен');
    
    logTestStep('Проверяем, что поля содержат данные пользователя');
    expect(screen.getByLabelText(/Фамилия:/i)).toHaveValue('Иванов');
    console.log('✓ Поле "Фамилия" содержит корректное значение');
    
    expect(screen.getByLabelText(/Имя:/i)).toHaveValue('Иван');
    console.log('✓ Поле "Имя" содержит корректное значение');
    
    expect(screen.getByLabelText(/Отчество:/i)).toHaveValue('Иванович');
    console.log('✓ Поле "Отчество" содержит корректное значение');
    
    expect(screen.getByLabelText(/Email:/i)).toHaveValue('ivanov@example.com');
    console.log('✓ Поле "Email" содержит корректное значение');
  });

  test('вызывает createUser при создании нового пользователя', async () => {
    logTestStep('Тест: Вызов createUser при создании нового пользователя');
    
    logTestStep('Настраиваем mock для успешного создания пользователя');
    createUser.mockResolvedValue({ data: { success: true } });
    
    logTestStep('Рендерим компонент');
    render(<UsersEditor {...mockProps} />);
    
    logTestStep('Заполняем форму');
    console.log('Заполняем поле "Фамилия"');
    fireEvent.change(screen.getByLabelText(/Фамилия:/i), { target: { value: 'Петров' } });
    
    console.log('Заполняем поле "Имя"');
    fireEvent.change(screen.getByLabelText(/Имя:/i), { target: { value: 'Петр' } });
    
    console.log('Заполняем поле "Email"');
    fireEvent.change(screen.getByLabelText(/Email:/i), { target: { value: 'petrov@example.com' } });
    
    console.log('Заполняем поле "Пароль"');
    fireEvent.change(screen.getByLabelText(/Пароль:/i), { target: { value: 'password123' } });
    
    logTestStep('Дожидаемся загрузки отделов');
    await waitFor(() => {
      expect(getDepartments).toHaveBeenCalledTimes(1);
    });
    console.log('✓ API getDepartments был вызван');
    
    logTestStep('Выбираем отдел из выпадающего списка');
    const departmentSelect = screen.getByLabelText(/Подразделение:/i);
    fireEvent.change(departmentSelect, { target: { value: 'ИТ отдел' } });
    
    logTestStep('Выбираем роль');
    // Получаем все выпадающие списки
    const selects = screen.getAllByRole('combobox');
    console.log(`Найдено ${selects.length} выпадающих списков`);
    
    // Селект роли должен быть вторым
    const roleSelect = selects[1];
    console.log('Выбираем селект роли');
    fireEvent.change(roleSelect, { target: { value: 'user' } });
    console.log('Установили значение роли: user');
    
    logTestStep('Выбираем статус');
    // Селект статуса должен быть третьим
    const statusSelect = selects[2];
    console.log('Выбираем селект статуса');
    fireEvent.change(statusSelect, { target: { value: 'active' } });
    console.log('Установили значение статуса: active');
    
    logTestStep('Нажимаем кнопку "Сохранить"');
    fireEvent.click(screen.getByText('Сохранить'));
    
    logTestStep('Проверяем, что createUser был вызван с правильными данными');
    await waitFor(() => {
      expect(createUser).toHaveBeenCalledTimes(1);
      console.log('✓ createUser был вызван 1 раз');
      
      expect(createUser).toHaveBeenCalledWith(expect.objectContaining({
        lastname: 'Петров',
        firstname: 'Петр',
        email: 'petrov@example.com',
        password: 'password123',
        department: 'ИТ отдел',
        role: 'user',
        status: 'active'
      }));
      console.log('✓ createUser был вызван с правильными данными');
      
      expect(mockProps.onSave).toHaveBeenCalledTimes(1);
      console.log('✓ onSave был вызван 1 раз');
    });
  });

  test('вызывает updateUser при редактировании существующего пользователя', async () => {
    logTestStep('Тест: Вызов updateUser при редактировании существующего пользователя');
    
    logTestStep('Настраиваем mock для успешного обновления пользователя');
    updateUser.mockResolvedValue({ data: { success: true } });
    
    const existingUser = {
      id: 1,
      lastname: 'Иванов',
      firstname: 'Иван',
      midlename: 'Иванович',
      email: 'ivanov@example.com',
      role: 'user',
      status: 'active',
      department: 'ИТ отдел'
    };
    
    logTestStep('Рендерим компонент с данными существующего пользователя');
    console.log('Пользователь:', JSON.stringify(existingUser, null, 2));
    render(<UsersEditor user={existingUser} {...mockProps} />);
    
    logTestStep('Изменяем фамилию');
    fireEvent.change(screen.getByLabelText(/Фамилия:/i), { target: { value: 'Сидоров' } });
    console.log('Новая фамилия: Сидоров');
    
    logTestStep('Нажимаем кнопку "Сохранить"');
    fireEvent.click(screen.getByText('Сохранить'));
    
    logTestStep('Проверяем, что updateUser был вызван с правильными данными');
    await waitFor(() => {
      expect(updateUser).toHaveBeenCalledTimes(1);
      console.log('✓ updateUser был вызван 1 раз');
      
      expect(updateUser).toHaveBeenCalledWith(1, expect.objectContaining({
        lastname: 'Сидоров',
        firstname: 'Иван',
        midlename: 'Иванович',
        email: 'ivanov@example.com'
      }));
      console.log('✓ updateUser был вызван с правильными данными');
      
      expect(mockProps.onSave).toHaveBeenCalledTimes(1);
      console.log('✓ onSave был вызван 1 раз');
    });
  });

  test('вызывает onCancel при нажатии кнопки "Отмена"', () => {
    logTestStep('Тест: Вызов onCancel при нажатии кнопки "Отмена"');
    
    logTestStep('Рендерим компонент');
    render(<UsersEditor {...mockProps} />);
    
    logTestStep('Нажимаем кнопку "Отмена"');
    fireEvent.click(screen.getByText('Отмена'));
    
    logTestStep('Проверяем, что onCancel был вызван');
    expect(mockProps.onCancel).toHaveBeenCalledTimes(1);
    console.log('✓ onCancel был вызван 1 раз');
  });

  test('переключает видимость пароля при нажатии на иконку', () => {
    logTestStep('Тест: Переключение видимости пароля при нажатии на иконку');
    
    logTestStep('Рендерим компонент');
    render(<UsersEditor {...mockProps} />);
    
    logTestStep('Проверяем начальное состояние поля пароля');
    const passwordInput = screen.getByLabelText(/Пароль:/i);
    expect(passwordInput).toHaveAttribute('type', 'password');
    console.log('✓ Поле пароля изначально скрыто (type="password")');
    
    logTestStep('Находим кнопку переключения пароля и кликаем');
    const toggleButton = screen.getByRole('button', { name: '' });
    fireEvent.click(toggleButton);
    console.log('Выполнен клик по кнопке переключения видимости пароля');
    
    logTestStep('Проверяем, что тип поля изменился');
    expect(passwordInput).toHaveAttribute('type', 'text');
    console.log('✓ Поле пароля стало видимым (type="text")');
  });
}); 