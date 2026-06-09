'use strict';

// Form: enhanced client-side validation feedback only.
// The form works without JS — Netlify handles submission natively.
(function () {
  var form = document.querySelector('.contact-form');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    var valid = true;

    form.querySelectorAll('[required]').forEach(function (field) {
      if (!field.value.trim()) {
        valid = false;
        field.classList.add('field-error');
        field.setAttribute('aria-invalid', 'true');
      } else {
        field.classList.remove('field-error');
        field.removeAttribute('aria-invalid');
      }
    });

    if (!valid) {
      e.preventDefault();
      var first = form.querySelector('.field-error');
      if (first) first.focus();
    }
  });

  // Clear error state on input
  form.querySelectorAll('[required]').forEach(function (field) {
    field.addEventListener('input', function () {
      if (field.value.trim()) {
        field.classList.remove('field-error');
        field.removeAttribute('aria-invalid');
      }
    });
  });
}());
