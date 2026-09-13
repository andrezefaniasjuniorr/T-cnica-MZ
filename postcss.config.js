export default {
  plugins: {
    autoprefixer: {
      overrideBrowserslist: [
        '> 0.5%',
        'last 2 versions',
        'Firefox ESR',
        'not dead',
        'Chrome >= 60',
        'Safari >= 11',
        'Edge >= 18',
        'iOS >= 11',
        'Android >= 6'
      ],
      flexbox: 'no-2009',
      grid: 'autoplace'
    }
  }
};
