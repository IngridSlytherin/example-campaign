/**
 * Form validation with just-validatate.js
 */
const validate = new JustValidate(formEl, {
    errorFieldCssClass: ['is-invalid']
});

validate
    .addField(
        '#id_first_name',
        [{
                rule: 'required',
                errorMessage: 'First name is required',
            },

            {
                rule: 'maxLength',
                value: 255,
            },
            {
                rule: 'customRegexp',
                value: /\b([A-ZÀ-ÿ][-,a-z. ']+[ ]*)+$/gi,
                errorMessage: 'Contains an invalid character',
            },

        ],

        {
            errorsContainer: '.invalid-fname',
        }
    )
    .addField(
        '#id_last_name',
        [{
                rule: 'required',
                errorMessage: 'Last name is required',
            },

            {
                rule: 'maxLength',
                value: 255,
            },
            {
                rule: 'customRegexp',
                value: /\b([A-ZÀ-ÿ][-,a-z. ']+[ ]*)+$/gi,
                errorMessage: 'Contains an invalid character',

            },
        ],

        {
            errorsContainer: '.invalid-lname',
        }
    )

    .addField(
        '#id_email',
        [{
                rule: 'required',
                errorMessage: 'Email is required',
            },
            {
                rule: 'email',
                errorMessage: 'Email is invalid!',
            },
            {
                rule: 'maxLength',
                value: 255,
            },
        ],

        {
            errorsContainer: '.invalid-email',

        }
    )
    .addField(
        '#id_phone_number', 
        [{
                rule: 'required',
                errorMessage: 'Valid US phone number required',
            },

            {
                rule: 'customRegexp',
                value: /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im,
                errorMessage: 'Invalid Number',

            },
            {
                rule: 'maxLength',
                value: 15,
            },
        ],
        {

            errorsContainer: '.invalid-ph',

        }
    )
    .addField('#id_shipping_address_line1', [{
            rule: 'required',
            errorMessage: 'Shipping address is required',
        },
        {
            rule: 'maxLength',
            value: 255,
        },
    ], {

        errorsContainer: '.invalid-shipping_address_line1',

    })
    .addField('#id_shipping_address_line4', [{
            rule: 'required',
            errorMessage: 'Shipping city is required',
        },
        {
            rule: 'maxLength',
            value: 255,
        },

    ], {

        errorsContainer: '.invalid-shipping_address_line4',

    })
    .addField('#id_shipping_state', [{
        rule: 'required',
        errorMessage: 'Shipping state/province is required',
    }, ], {

        errorsContainer: '.invalid-shipping_state',

    })
    .addField('#id_shipping_postcode', [{
            rule: 'required',
            errorMessage: 'Shipping ZIP/Postcode is required',
        },
        {
            rule: 'maxLength',
            value: 64,
        },
    ], {

        errorsContainer: '.invalid-shipping_postcode',

    })
    .addField('#id_shipping_country', [{
        rule: 'required',
        errorMessage: 'Shipping country is required',
    }, ], {

        errorsContainer: '.invalid-shipping_country',

    })


    .onFail((fields) => {
        console.log('Field validation fail', fields);
    })
    .onSuccess((event) => {
        console.log('Field validation pass, submit card details', event);
        document.getElementById('payment_method').value = 'card_token';
        Spreedly.validate();
    });


/**
 * Card Validation with Spreedly iFrame
 */

const style = 'color: #212529; font-size: 1rem; line-height: 1.5; font-weight: 400;width: calc(100% - 20px); height: calc(100% - 2px); position: absolute;padding: 0.13rem .75rem';

// set placeholders and styles for iframe fields to make UI style
Spreedly.on("ready", function() {
    Spreedly.setFieldType('text');
    Spreedly.setPlaceholder('cvv', "CVV");
    Spreedly.setPlaceholder('number', "Card Number");
    Spreedly.setNumberFormat('prettyFormat');
    Spreedly.setStyle('cvv', style);
    Spreedly.setStyle('number', style);

    btnCC.removeAttribute('disabled');
});

// handle form submit and tokenize the card
function submitPaymentForm() {
    // reset form when submit, only for demo page, can ignore
    cardErrBlock.innerHTML = '';
    // Get required, non-sensitive, values from host page
    var requiredFields = {};
    requiredFields["first_name"] = firstName.value;
    requiredFields["last_name"] = lastName.value;
    requiredFields["month"] = expMonth.value;
    requiredFields["year"] = expYear.value;

    Spreedly.tokenizeCreditCard(requiredFields);

}

// handle tokenization errors from spreedly to show to end user
Spreedly.on('errors', function(errors) {
    console.log('Card validation fail', errors);
    let error_html = '';
    errors.forEach(element => {
        error_html += `${element.message}<br/>`;

        if (element["attribute"] == "number") {
            numberParent.classList.add("is-invalid");
            numberParent.classList.remove("is-valid");
        } else {
            numberParent.classList.remove("is-invalid");

        }
        if (element["attribute"] == "month") {

            expMonth.classList.add("is-invalid");
            document.querySelector('.is-invalid').focus();

        } else {
            expMonth.classList.remove("is-invalid");

        }
        if (element["attribute"] == "year") {

            expYear.classList.add("is-invalid");
            document.querySelector('.is-invalid').focus();

        } else {
            expYear.classList.remove("is-invalid");

        }
    });

    if (error_html) {
        cardErrBlock.innerHTML = `
                <div class="alert alert-danger">
                    ${error_html}
                </div>
            `;
    }

    btnCC.removeAttribute('disabled');
});

Spreedly.on('fieldEvent', function(name, type, activeEl, inputProperties) {

    if (type == "input" && name == "number") {
        if (inputProperties["validNumber"]) {
            Spreedly.setStyle('number', "background-color: #CDFFE6;")
            numberParent.classList.remove("is-invalid");
        } else {
            Spreedly.setStyle('number', "background-color: transparent;")
            numberParent.classList.remove("is-invalid");
            cardErrBlock.innerHTML = ``;
        }
    } else if (type == "input" && name == "cvv") {
        if (inputProperties["validCvv"]) {
            Spreedly.setStyle('cvv', "background-color: #CDFFE6;")
            cvvParent.classList.remove("is-invalid");
        } else {
            Spreedly.setStyle('cvv', "background-color: transparent")
            cvvParent.classList.remove("is-invalid");
            cardErrBlock.innerHTML = ``;
        }
    }

});

Spreedly.on('validation', function(inputProperties) {

    if (!inputProperties["validNumber"]) {
        numberParent.classList.add("is-invalid");
        Spreedly.transferFocus("number");
        numberParent.classList.remove("is-valid");
        cardErrBlock.innerHTML = `
                    <div class="alert alert-danger">
                        Please enter a valid card number
                    </div>
                `;
    } else if (!inputProperties["validCvv"]) {

        cvvParent.classList.add("is-invalid");
        Spreedly.transferFocus("cvv");
        cvvParent.classList.remove("is-valid");
        cardErrBlock.innerHTML = `
                    <div class="alert alert-danger">
                        Please enter a valid CVV number
                    </div>
                `;

    } else {
        submitPaymentForm();
    }



});

// handle payment method (card token) after successfully created
Spreedly.on('paymentMethod', function(token, pmData) {
    document.getElementById('card_token').value = token;
    createOrder();

});

//checkbox billing

document.addEventListener('DOMContentLoaded', function() {
    const checkbox = document.getElementById('form-toggle-checkbox');
    const billingForm = document.getElementById('form-billing-address');
    const billingFirstName = document.getElementById('billing_first_name');
    const billingLastName = document.getElementById('billing_last_name');
    const billingAddress = document.getElementById('billing_address_line1');
    const billingCity = document.getElementById('billing_city');
    const billingState = document.getElementById('billing_state');
    const billingPostcode = document.getElementById('billing_postcode');
    const shippingFirstName = document.getElementById('id_first_name');
    const shippingLastName = document.getElementById('id_last_name');
    const submitButton = document.getElementById('cc-submit-button');
    const form = document.querySelector('form');
    const nextURL = '/upsell.html'; // Redirect URL

    // Prevent traditional form submission
    form.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent form submission
    });

    // Function to toggle the visibility of the billing address form
    function toggleBillingForm() {
        if (checkbox.checked) {
            billingForm.style.display = 'none'; // Hide the billing form
            removeRequiredFields(); // Remove required attribute from billing fields
            enableSubmitButton(); // Enable submit button if checkbox is checked
        } else {
            billingForm.style.display = 'block'; // Show the billing form
            setRequiredFields(); // Set billing fields as required
            validateBillingForm(); // Validate the form and disable button if necessary
        }
    }

    // Set billing fields as required
    function setRequiredFields() {
        billingFirstName.setAttribute('required', true);
        billingLastName.setAttribute('required', true);
        billingAddress.setAttribute('required', true);
        billingCity.setAttribute('required', true);
        billingState.setAttribute('required', true);
        billingPostcode.setAttribute('required', true);
    }

    // Remove required attribute from billing fields
    function removeRequiredFields() {
        billingFirstName.removeAttribute('required');
        billingLastName.removeAttribute('required');
        billingAddress.removeAttribute('required');
        billingCity.removeAttribute('required');
        billingState.removeAttribute('required');
        billingPostcode.removeAttribute('required');
    }

    // Copy "Customer Information" first name and last name to "Billing Address" fields
    function copyShippingToBilling() {
        billingFirstName.value = shippingFirstName.value;
        billingLastName.value = shippingLastName.value;
    }

    // Function to show error on a field (highlight in red)
    function showFieldError(field) {
        field.classList.add('is-invalid');  // Add visual error class
    }

    // Function to remove error from a field
    function removeFieldError(field) {
        field.classList.remove('is-invalid');  // Remove visual error class
    }

    // Billing form validation function
    function validateBillingForm() {
        let isValid = true;

        if (!checkbox.checked) {
            // if (billingFirstName.value.trim() === '') {
            //     showFieldError(billingFirstName);
            //     isValid = false;
            // } else {
            //     removeFieldError(billingFirstName);
            // }

            // if (billingLastName.value.trim() === '') {
            //     showFieldError(billingLastName);
            //     isValid = false;
            // } else {
            //     removeFieldError(billingLastName);
            // }

            if (billingAddress.value.trim() === '') {
                showFieldError(billingAddress);
                isValid = false;
            } else {
                removeFieldError(billingAddress);
            }

            if (billingCity.value.trim() === '') {
                showFieldError(billingCity);
                isValid = false;
            } else {
                removeFieldError(billingCity);
            }

            if (billingState.value.trim() === '') {
                showFieldError(billingState);
                isValid = false;
            } else {
                removeFieldError(billingState);
            }

            if (billingPostcode.value.trim() === '') {
                showFieldError(billingPostcode);
                isValid = false;
            } else {
                removeFieldError(billingPostcode);
            }
        }

        // If all fields are valid, enable the submit button, otherwise disable it
        if (isValid) {
            enableSubmitButton();
        } else {
            disableSubmitButton();
        }

        return isValid;
    }

    // Function to enable the submit button
    function enableSubmitButton() {
        submitButton.disabled = false;
    }

    // Function to disable the submit button
    function disableSubmitButton() {
        submitButton.disabled = true;
    }

    // Listener for the submit button
    submitButton.addEventListener('click', function(event) {
        event.preventDefault(); // Prevent default form submission behavior

        // Check if all required fields are filled correctly
        if (!validateBillingForm()) {
            disableSubmitButton(); // Disable the button if fields are not filled
            return; // Stop if validation fails
        }

        // Tokenize the credit card with Spreedly only if validation passes
        Spreedly.tokenizeCreditCard({
            first_name: shippingFirstName.value,
            last_name: shippingLastName.value,
            month: document.getElementById('id_expiry_month').value,
            year: document.getElementById('id_expiry_year').value
        });
    });

    // Function to redirect after card tokenization
    Spreedly.on('paymentMethod', function(token, pmData) {
        document.getElementById('card_token').value = token;

        // Manually redirect to the upsell page without submitting the form via GET
        if (validateBillingForm()) {
            window.location.href = nextURL; // Redirect to upsell.html
        }
    });

    // Listener for the checkbox
    checkbox.addEventListener('change', function() {
        toggleBillingForm();
        if (!checkbox.checked) {
            // If checkbox is unchecked, copy the names from "Customer Information"
            copyShippingToBilling();
        }
    });

    // Listener to update the button state when fields are filled
    billingFirstName.addEventListener('input', validateBillingForm);
    billingLastName.addEventListener('input', validateBillingForm);
    billingAddress.addEventListener('input', validateBillingForm);
    billingCity.addEventListener('input', validateBillingForm);
    billingState.addEventListener('input', validateBillingForm);
    billingPostcode.addEventListener('input', validateBillingForm);

    // Ensure the billing form starts hidden and not required on page load
    toggleBillingForm();
});
