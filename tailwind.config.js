/** @type {import('tailwindcss').Config} */

module.exports = {
  
  content: [
    './src/views/**/*.hbs',
  ],

  theme: {
    extend: {
        // Añade el parámetro `w-25rem`
      width: {
        'w-98': '25rem',
      },


    },
  },
  plugins: [],
};