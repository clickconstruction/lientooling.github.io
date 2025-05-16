// Mock data for testing
const mockData = {
    'mechanics-lien': {
        'claimantType': 'company',
        'claimant-name': 'Malachi Whites',
        'company-name': 'Click Plumbing LLC',
        'claimant-address': '5501 Balcones Dr A141',
        'claimant-city': 'Austin',
        'claimant-state': 'Texas',
        'claimant-zip': '78731',
        'owner-name': 'Alice Johnson',
        'property-address': '456 Development Ave',
        'property-city': 'Austin',
        'property-state': 'TX',
        'property-zip': '78702',
        'legal-description': 'Lot 7, Block 3, Riverside Division, a subdivision in Travis County, Texas',
        'work-description': 'Complete renovation of kitchen including cabinets, countertops, electrical, and plumbing work',
        'work-start': '2025-01-15',
        'work-end': '2025-04-15',
        'unpaid-amount': '25000',
        'notice-date': '2025-05-01'
    },
    'release-lien': {
        'lien-reference': 'ML2025-0123',
        'payment-date': '2025-05-10',
        'claimant-name': 'Malachi Whites',
        'company-name': 'Click Plumbing LLC',
        'claimant-address': '5501 Balcones Dr A141',
        'claimant-city': 'Austin',
        'claimant-state': 'Texas',
        'claimant-zip': '78731',
        'property-county': 'Travis',
        'owner-name': 'Alice Johnson',
        'property-description': 'Lot 7, Block 3, Riverside Division, a subdivision in Travis County, Texas',
        'property-address': '456 Development Ave',
        'property-city': 'Austin',
        'property-state': 'TX',
        'property-zip': '78702'
    },
    'demand-letter': {
        'business-name': 'Click Plumbing LLC',
        'sender-name': 'Malachi Whites, Owner',
        'business-address': '5501 Balcones Dr A141',
        'business-city': 'Austin',
        'business-state': 'Texas',
        'business-zip': '78731',
        'business-phone': '(512) 555-1234',
        'business-email': 'malachi@clickplumbing.com',
        'client-name': 'Alice Johnson',
        'client-address': '456 Development Ave',
        'client-city': 'Austin',
        'client-state': 'Texas',
        'client-zip': '78702',
        'client-county': 'Travis',
        'invoice-number': 'INV-2025-0456',
        'invoice-date': '2025-04-15',
        'due-date': '2025-04-30',
        'payment-deadline': '2025-05-25',
        'service-description': 'Complete renovation of kitchen including cabinets, countertops, electrical, and plumbing work',
        'service-dates': 'January 15 - April 15, 2025',
        'completion-date': '2025-04-15',
        'invoice-total': '25000',
        'payments-received': '0',
        'outstanding-balance': '25000',
        'include-late-fees': true,
        'include-notarial': true,
        'payment-method': 'Payment can be made by bank transfer to Click Plumbing LLC 5501 Balcones Dr A141 Austin TX 78731, Routing: 091311229, Checking: 202511226605.'
    }
};

function fillFormWithTestData(formId) {
    const form = document.getElementById(formId);
    const data = mockData[formId];
    
    // Set radio buttons first (for mechanic's lien form)
    if (formId === 'mechanics-lien') {
        const radioBtn = form.querySelector(`input[name="claimantType"][value="${data['claimantType']}"]`);
        if (radioBtn) {
            radioBtn.click(); // This will trigger the change event
        }
    }
    
    // Set values by name attribute, handling different input types
    Object.keys(data).forEach(key => {
        const input = form.querySelector(`[name="${key}"]`);
        if (input) {
            if (input.type === 'checkbox') {
                // For checkboxes, set the checked property
                input.checked = data[key];
            } else {
                // For other input types, set the value
                input.value = data[key];
            }
        }
    });

    // Mark form as touched for validation
    form.classList.add('was-validated');
}

// Function to look up county from address using Google Maps Geocoding API
async function lookupCounty(address, city, state, zip) {
    // Construct the full address
    const fullAddress = `${address}, ${city}, ${state} ${zip}`;
    
    try {
        // Using the provided Google Maps API key
        const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(fullAddress)}&key=AIzaSyB8t-Z1vqPPPVyIoT2DVTkGsve7OioKEA4`);
        const data = await response.json();
        
        if (data.status === 'OK') {
            // Look for the county in the address components
            for (const component of data.results[0].address_components) {
                if (component.types.includes('administrative_area_level_2')) {
                    // Found the county, remove 'County' from the end if present
                    let county = component.long_name;
                    return county.replace(' County', '');
                }
            }
        }
    } catch (error) {
        console.error('Error looking up county:', error);
    }
    
    return '';
}

document.addEventListener('DOMContentLoaded', function() {
    // Get the current page form ID based on the HTML file name
    const currentPage = window.location.pathname.split('/').pop();
    let currentFormId = '';
    
    if (currentPage === 'mechanics-lien.html') {
        currentFormId = 'mechanics-lien';
    } else if (currentPage === 'release-lien.html') {
        currentFormId = 'release-lien';
    } else if (currentPage === 'demand-letter.html') {
        currentFormId = 'demand-letter';
    }
    
    // Add event listener for the test data button
    const testDataBtn = document.getElementById('test-data-btn');
    if (testDataBtn && currentFormId) {
        testDataBtn.addEventListener('click', function() {
            fillFormWithTestData(currentFormId);
            
            // If it's the demand letter form, use the specific function from demand-letter.js
            if (currentFormId === 'demand-letter' && typeof fillDemandLetterWithTestData === 'function') {
                fillDemandLetterWithTestData();
            }
        });
    }
    
    // Add event listeners for property address fields to auto-fill county for Mechanic's Lien form
    const propertyAddressInput = document.querySelector('input[name="property-address"]');
    const propertyCityInput = document.querySelector('input[name="property-city"]');
    const propertyStateInput = document.querySelector('input[name="property-state"]');
    const propertyZipInput = document.querySelector('input[name="property-zip"]');
    const propertyCountyInput = document.querySelector('input[name="property-county"]');
    const lookupCountyBtn = document.getElementById('lookup-county-btn');
    
    // Add event listeners for Release of Lien form - Claimant Information
    const claimantAddressInput = document.querySelector('#release-lien input[name="claimant-address"]');
    const claimantCityInput = document.querySelector('#release-lien input[name="claimant-city"]');
    const claimantStateInput = document.querySelector('#release-lien input[name="claimant-state"]');
    const claimantZipInput = document.querySelector('#release-lien input[name="claimant-zip"]');
    const releaseCountyInput = document.querySelector('#release-lien input[name="property-county"]');
    const lookupCountyBtnRelease = document.getElementById('lookup-county-btn-release');
    
    // Add event listeners for Release of Lien form - Property Information
    const propertyAddressInputRelease = document.querySelector('#release-lien input[name="property-address"]');
    const propertyCityInputRelease = document.querySelector('#release-lien input[name="property-city"]');
    const propertyStateInputRelease = document.querySelector('#release-lien input[name="property-state"]');
    const propertyZipInputRelease = document.querySelector('#release-lien input[name="property-zip"]');
    const propertyCountyInputRelease = document.querySelector('#release-lien input[name="property-county"]:nth-of-type(2)');
    const lookupCountyBtnProperty = document.getElementById('lookup-county-btn-property');
    
    // Function to check if all address fields are filled and lookup county
    function checkAndLookupCounty() {
        const address = propertyAddressInput.value.trim();
        const city = propertyCityInput.value.trim();
        const state = propertyStateInput.value.trim();
        const zip = propertyZipInput.value.trim();
        
        if (address && city && state && zip) {
            // Show loading indicator on the button
            if (lookupCountyBtn) {
                lookupCountyBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Looking up...';
                lookupCountyBtn.disabled = true;
            }
            
            // All fields are filled, look up county
            lookupCounty(address, city, state, zip).then(county => {
                if (county) {
                    propertyCountyInput.value = county;
                } else {
                    alert('County not found. Please enter manually.');
                }
                
                // Reset button
                if (lookupCountyBtn) {
                    lookupCountyBtn.innerHTML = 'Lookup County';
                    lookupCountyBtn.disabled = false;
                }
            }).catch(error => {
                console.error('Error in county lookup:', error);
                alert('Error looking up county. Please enter manually.');
                
                // Reset button
                if (lookupCountyBtn) {
                    lookupCountyBtn.innerHTML = 'Lookup County';
                    lookupCountyBtn.disabled = false;
                }
            });
        } else {
            alert('Please fill in all address fields (Address, City, State, and ZIP) before looking up the county.');
        }
    }
    
    // Add click event listener to the lookup button for Mechanic's Lien form
    if (lookupCountyBtn) {
        lookupCountyBtn.addEventListener('click', checkAndLookupCounty);
    }
    
    // Function to check if all address fields are filled and lookup county for Release of Lien form
    function checkAndLookupCountyRelease() {
        const address = claimantAddressInput.value.trim();
        const city = claimantCityInput.value.trim();
        const state = claimantStateInput.value.trim();
        const zip = claimantZipInput.value.trim();
        
        if (address && city && state && zip) {
            // Show loading indicator on the button
            if (lookupCountyBtnRelease) {
                lookupCountyBtnRelease.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Looking up...';
                lookupCountyBtnRelease.disabled = true;
            }
            
            // All fields are filled, look up county
            lookupCounty(address, city, state, zip).then(county => {
                if (county) {
                    releaseCountyInput.value = county;
                } else {
                    alert('County not found. Please enter manually.');
                }
                
                // Reset button
                if (lookupCountyBtnRelease) {
                    lookupCountyBtnRelease.innerHTML = 'Lookup County';
                    lookupCountyBtnRelease.disabled = false;
                }
            }).catch(error => {
                console.error('Error in county lookup:', error);
                alert('Error looking up county. Please enter manually.');
                
                // Reset button
                if (lookupCountyBtnRelease) {
                    lookupCountyBtnRelease.innerHTML = 'Lookup County';
                    lookupCountyBtnRelease.disabled = false;
                }
            });
        } else {
            alert('Please fill in all address fields (Address, City, State, and ZIP) before looking up the county.');
        }
    }
    
    // Add click event listener to the lookup button for Release of Lien form
    if (lookupCountyBtnRelease) {
        lookupCountyBtnRelease.addEventListener('click', checkAndLookupCountyRelease);
    }
    
    // Also keep the automatic lookup on blur for convenience for Mechanic's Lien form
    if (propertyAddressInput) {
        propertyAddressInput.addEventListener('blur', function() {
            // Only auto-lookup if all fields are filled
            const address = propertyAddressInput.value.trim();
            const city = propertyCityInput.value.trim();
            const state = propertyStateInput.value.trim();
            const zip = propertyZipInput.value.trim();
            
            if (address && city && state && zip) {
                lookupCounty(address, city, state, zip).then(county => {
                    if (county) {
                        propertyCountyInput.value = county;
                    }
                });
            }
        });
    }
    
    // Add automatic lookup on blur for Release of Lien form - Property Information
    if (propertyAddressInputRelease) {
        propertyAddressInputRelease.addEventListener('blur', function() {
            // Only auto-lookup if all fields are filled
            const address = propertyAddressInputRelease.value.trim();
            const city = propertyCityInputRelease.value.trim();
            const state = propertyStateInputRelease.value.trim();
            const zip = propertyZipInputRelease.value.trim();
            
            if (address && city && state && zip) {
                lookupCounty(address, city, state, zip).then(county => {
                    if (county) {
                        if (propertyCountyInputRelease) {
                            propertyCountyInputRelease.value = county;
                        }
                    }
                });
            }
        });
    }
    if (claimantAddressInput) {
        claimantAddressInput.addEventListener('blur', function() {
            // Only auto-lookup if all fields are filled
            const address = claimantAddressInput.value.trim();
            const city = claimantCityInput.value.trim();
            const state = claimantStateInput.value.trim();
            const zip = claimantZipInput.value.trim();
            
            if (address && city && state && zip) {
                lookupCounty(address, city, state, zip).then(county => {
                    if (county) {
                        releaseCountyInput.value = county;
                    }
                });
            }
        });
    }
    
    // Function to check if all property address fields are filled and lookup county for Release of Lien form
    function checkAndLookupCountyProperty() {
        const address = propertyAddressInputRelease.value.trim();
        const city = propertyCityInputRelease.value.trim();
        const state = propertyStateInputRelease.value.trim();
        const zip = propertyZipInputRelease.value.trim();
        
        if (address && city && state && zip) {
            // Show loading indicator on the button
            if (lookupCountyBtnProperty) {
                lookupCountyBtnProperty.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Looking up...';
                lookupCountyBtnProperty.disabled = true;
            }
            
            // All fields are filled, look up county
            lookupCounty(address, city, state, zip).then(county => {
                if (county) {
                    // Find the correct county input field
                    const countyInputs = document.querySelectorAll('#release-lien input[name="property-county"]');
                    if (countyInputs.length > 1) {
                        countyInputs[1].value = county; // Second county input in the form
                    } else {
                        console.error('Could not find property county input field');
                    }
                } else {
                    alert('County not found. Please enter manually.');
                }
                
                // Reset button
                if (lookupCountyBtnProperty) {
                    lookupCountyBtnProperty.innerHTML = 'Lookup County';
                    lookupCountyBtnProperty.disabled = false;
                }
            }).catch(error => {
                console.error('Error in county lookup:', error);
                alert('Error looking up county. Please enter manually.');
                
                // Reset button
                if (lookupCountyBtnProperty) {
                    lookupCountyBtnProperty.innerHTML = 'Lookup County';
                    lookupCountyBtnProperty.disabled = false;
                }
            });
        } else {
            alert('Please fill in all property address fields (Address, City, State, and ZIP) before looking up the county.');
        }
    }
    
    // Add click event listener to the property lookup button for Release of Lien form
    if (lookupCountyBtnProperty) {
        lookupCountyBtnProperty.addEventListener('click', checkAndLookupCountyProperty);
    }
    if (propertyCityInput) {
        propertyCityInput.addEventListener('blur', function() { /* Same auto-lookup logic */ });
    }
    if (propertyStateInput) {
        propertyStateInput.addEventListener('blur', function() { /* Same auto-lookup logic */ });
    }
    if (propertyZipInput) {
        propertyZipInput.addEventListener('blur', function() { /* Same auto-lookup logic */ });
    }
    
    // Form navigation
    const navLinks = document.querySelectorAll('.nav-link');
    const forms = {
        'mechanics-lien': document.getElementById('mechanics-lien'),
        'release-lien': document.getElementById('release-lien')
    };

    // Store form data when switching tabs
    let storedFormData = {
        'mechanics-lien': new FormData(),
        'release-lien': new FormData()
    };
    
    // Function to save form data before switching tabs
    function saveFormData(formId) {
        const form = document.getElementById(formId);
        if (form) {
            storedFormData[formId] = new FormData(form);
        }
    }
    
    // Function to restore form data after switching tabs
    function restoreFormData(formId) {
        const form = document.getElementById(formId);
        if (form && storedFormData[formId]) {
            const data = storedFormData[formId];
            
            // Iterate through all form elements and restore values
            Array.from(form.elements).forEach(element => {
                if (element.name && data.has(element.name)) {
                    element.value = data.get(element.name);
                }
            });
        }
        
        // Hide the print view when switching forms
        const printView = document.getElementById('print-view');
        if (printView) {
            printView.style.display = 'none';
            printView.innerHTML = ''; // Clear the content
        }
    }

    // Handle claimant type toggle
    const claimantTypeRadios = document.querySelectorAll('input[name="claimantType"]');
    const companyFields = document.querySelectorAll('.company-field');

    claimantTypeRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            companyFields.forEach(field => {
                field.style.display = e.target.value === 'company' ? 'block' : 'none';
            });
        });
    });

    // Form validation and PDF generation

    // Add direct click handlers to the submit buttons
    document.querySelectorAll('button[type="submit"]').forEach(button => {
        button.addEventListener('click', function(event) {
            event.preventDefault();
            console.log('Submit button clicked');
            
            const form = this.closest('form');
            if (!form) {
                console.error('No form found for this button');
                return;
            }
            
            console.log('Form found:', form.id);
            
            // Special handling for demand letter form
            if (form.id === 'demand-letter') {
                // Let the demand-letter.js handle this form
                return;
            }
            
            if (!form.checkValidity()) {
                console.log('Form is invalid');
                event.stopPropagation();
                form.classList.add('was-validated');
                
                // Find all invalid fields
                const invalidFields = form.querySelectorAll(':invalid');
                let invalidFieldNames = [];
                
                invalidFields.forEach(field => {
                    if (field.name && field.required) {
                        // Get the label text for this field
                        const label = field.closest('.form-group, .mb-3')?.querySelector('label')?.textContent || field.name;
                        invalidFieldNames.push(label);
                    }
                });
                
                // Create alert message
                if (invalidFieldNames.length > 0) {
                    const message = `Please fill out the following required fields:\n- ${invalidFieldNames.join('\n- ')}`;
                    alert(message);
                } else {
                    alert('Please fill out all required fields.');
                }
                
                return;
            }
            
            console.log('Form is valid, creating print view');
            createPrintView(form);
        });
    });
    
    // Also keep the form submit handlers as a backup
    Object.values(forms).forEach(form => {
        if (form) { // Add null check
            form.addEventListener('submit', function(event) {
                event.preventDefault();
                console.log('Form submitted:', this.id);
                
                if (!form.checkValidity()) {
                    event.stopPropagation();
                    form.classList.add('was-validated');
                
                // Find all invalid fields
                const invalidFields = form.querySelectorAll(':invalid');
                let invalidFieldNames = [];
                
                invalidFields.forEach(field => {
                    if (field.name && field.required) {
                        // Get the label text for this field
                        const label = field.closest('.form-group, .mb-3')?.querySelector('label')?.textContent || field.name;
                        invalidFieldNames.push(label);
                    }
                });
                
                // Create alert message
                if (invalidFieldNames.length > 0) {
                    const message = `Please fill out the following required fields:\n- ${invalidFieldNames.join('\n- ')}`;
                    alert(message);
                } else {
                    alert('Please fill out all required fields.');
                }
                
                return;
            }

            createPrintView(form);
        });
        }
    });
});

function formatDate(date) {
    if (!date) return '';
    const d = new Date(date);
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

// Helper function to generate Mechanic's Lien HTML content
function generateMechanicsLienHTML(formData, formValues) {
    return `
        <div class="legal-header">Mechanic's Lien Affidavit</div>
        
        <div class="state-county">
            STATE OF TEXAS<br>
            COUNTY OF ${formValues['property-county'].toUpperCase()}
        </div>
        
        <div class="before-me">
            BEFORE ME, the undersigned authority, on this day personally appeared 
            ${formValues['claimant-name']}, known to me to be the person whose name is subscribed 
            hereto and upon oath deposes and says:
        </div>
        
        <div class="numbered-section">
            <h3>1.</h3> <span class="section-content">
            My name is ${formValues['claimant-name']}. 
            ${formValues['claimantType'] === 'company' ? `I am the authorized representative of ${formValues['company-name']}, ` : ''}
            hereinafter referred to as "Claimant." 
            Claimant's address is ${formValues['claimant-address']}, ${formValues['claimant-city']}, 
            ${formValues['claimant-state']} ${formValues['claimant-zip']}.
            </span>
        </div>
        
        <div class="numbered-section">
            <h3>2.</h3> <span class="section-content">
            Claimant has furnished labor and/or materials for improvements to the following described 
            real property located in ${formValues['property-county']} County, Texas:
            <br><br>
            ${formValues['legal-description']}
            <br><br>
            The property is owned by ${formValues['owner-name']} and is commonly known as:
            ${formValues['property-address']}, ${formValues['property-city']}, 
            ${formValues['property-state']} ${formValues['property-zip']}.
            </span>
        </div>
        
        <div class="numbered-section">
            <h3>3.</h3> <span class="section-content">
            The labor and/or materials furnished by Claimant consisted of:
            <br><br>
            ${formValues['work-description']}
            </span>
        </div>
        
        <div class="numbered-section">
            <h3>4.</h3> <span class="section-content">
            Claimant furnished the labor and/or materials under an agreement with 
            ${formValues['owner-name']}. The labor and/or materials were furnished between 
            ${formatDate(formValues['work-start'])} and ${formatDate(formValues['work-end'])}.
            </span>
        </div>
        
        <div class="numbered-section">
            <h3>5.</h3> <span class="section-content">
            The amount due and unpaid to Claimant for such labor and/or materials is 
            $${parseFloat(formValues['unpaid-amount']).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}.
            </span>
        </div>
        
        <div class="numbered-section">
            <h3>6.</h3> <span class="section-content">
            Claimant sent notice of the unpaid amount to the property owner on 
            ${formatDate(formValues['notice-date'])} as required by law.
            </span>
        </div>
        
        <div class="numbered-section">
            <h3>7.</h3> <span class="section-content">
            Claimant claims a lien against all of the above-described property and improvements 
            thereon in the amount of $${parseFloat(formValues['unpaid-amount']).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}.
            </span>
        </div>
        
        <div class="signature-section">
            <div class="signature-line"></div>
            <div>${formValues['claimant-name']}</div>
            ${formValues['claimantType'] === 'company' ? `<div>${formValues['company-name']}</div>` : ''}
            <div>Claimant</div>
        </div>
        
        <div class="notary-section">
            <p>
            SUBSCRIBED AND SWORN TO BEFORE ME on this the ______ day of ______________, ${new Date().getFullYear()}, 
            to certify which witness my hand and official seal.
            </p>
            
            <div class="signature-line"></div>
            <div>Notary Public, State of Texas</div>
            <div>My Commission Expires: _______________</div>
        </div>
    `;
}

// Helper function to generate Release of Lien HTML content
function generateReleaseLienHTML(formData, formValues) {
    return `
        <div class="legal-header">Release of Mechanic's Lien</div>
        
        <div class="state-county">
            STATE OF TEXAS<br>
            COUNTY OF ${formValues['property-county'].toUpperCase()}
        </div>
        
        <div class="before-me">
            KNOW ALL MEN BY THESE PRESENTS:
        </div>
        
        <div class="numbered-section">
            <h3>1.</h3> <span class="section-content">
            That ${formValues['claimant-name']}, 
            ${formValues['company-name'] ? `of ${formValues['company-name']}, ` : ''}
            whose address is ${formValues['claimant-address']}, ${formValues['claimant-city']}, 
            ${formValues['claimant-state']} ${formValues['claimant-zip']}, 
            hereinafter referred to as "Claimant", does hereby release, discharge, and relinquish 
            any and all liens, lien claims, or right to lien held by Claimant against the property 
            described below.
            </span>
        </div>
        
        <div class="numbered-section">
            <h3>2.</h3> <span class="section-content">
            This release applies to that certain Mechanic's Lien filed by Claimant against property 
            owned by ${formValues['owner-name']}, recorded under Instrument or File Number 
            ${formValues['lien-reference']} in the Official Public Records of ${formValues['property-county']} 
            County, Texas.
            </span>
        </div>
        
        <div class="numbered-section">
            <h3>3.</h3> <span class="section-content">
            The property subject to this release is described as follows:
            <br><br>
            ${formValues['property-description']}
            <br><br>
            The property is commonly known as:
            ${formValues['property-address']}, ${formValues['property-city']}, 
            ${formValues['property-state']} ${formValues['property-zip']}.
            </span>
        </div>
        
        <div class="numbered-section">
            <h3>4.</h3> <span class="section-content">
            This Release of Lien is executed on account of payment and/or satisfaction of the debt 
            secured by said lien on ${formatDate(formValues['payment-date'])}.
            </span>
        </div>
        
        <div class="signature-section">
            <p>EXECUTED this ______ day of ______________, ${new Date().getFullYear()}.</p>
            
            <div class="signature-line"></div>
            <div>${formValues['claimant-name']}</div>
            ${formValues['company-name'] ? `<div>${formValues['company-name']}</div>` : ''}
            <div>Claimant</div>
        </div>
        
        <div class="notary-section">
            <div class="state-county">
                STATE OF TEXAS<br>
                COUNTY OF _______________
            </div>
            
            <p>
            BEFORE ME, the undersigned authority, on this day personally appeared 
            ${formValues['claimant-name']}, known to me to be the person whose name is subscribed 
            to the foregoing instrument, and acknowledged to me that he/she executed the same for 
            the purposes and consideration therein expressed.
            </p>
            
            <p>
            GIVEN UNDER MY HAND AND SEAL OF OFFICE on this the ______ day of ______________, ${new Date().getFullYear()}.
            </p>
            
            <div class="signature-line"></div>
            <div>Notary Public, State of Texas</div>
            <div>My Commission Expires: _______________</div>
        </div>
    `;
}

function createPrintView(form) {
    const printView = document.getElementById('print-view');
    const formId = form.id;
    
    // Clear previous content
    printView.innerHTML = '';
    
    // Create print preview header with print button
    const previewHeader = document.createElement('div');
    previewHeader.className = 'print-preview-header no-print';
    previewHeader.innerHTML = `
        <h3>Print Preview</h3>
        <button class="btn btn-primary" onclick="window.print()">Print Document</button>
    `;
    printView.appendChild(previewHeader);
    
    // Create the print view content container
    const printContent = document.createElement('div');
    printContent.className = 'print-view';
    
    // Get form data
    const formData = new FormData(form);
    const formValues = {};
    formData.forEach((value, key) => {
        formValues[key] = value;
    });
    
    // Create document based on form type
    const isReleaseForm = form.id === 'release-lien';
    const isLienForm = form.id === 'mechanics-lien';
    const isDemandLetter = form.id === 'demand-letter';
    const title = isLienForm ? "Mechanic's Lien Form" : "Release of Lien Form";
    const today = new Date().toLocaleDateString();
    
    // Helper function to format addresses
    function formatAddress(street, city, state, zip) {
        const parts = [street, city, state, zip].filter(part => part);
        return parts.join(', ');
    }

    // Get all form data with proper formatting
    const county = formData.get('property-county') || '';
    const claimantName = formData.get('claimant-name') || '';
    const companyName = formData.get('company-name') || '';
    const claimantAddress = formatAddress(
        formData.get('claimant-address'),
        formData.get('claimant-city'),
        formData.get('claimant-state'),
        formData.get('claimant-zip')
    );
    const ownerName = formData.get('owner-name') || '';
    const propertyAddress = formatAddress(
        formData.get('property-address'),
        formData.get('property-city'),
        formData.get('property-state'),
        formData.get('property-zip')
    );
    const legalDescription = formData.get('legal-description') || '';
    const propertyDescription = legalDescription || propertyAddress;
    const workDescription = formData.get('work-description') || '';
    const workStart = formatDate(formData.get('work-start'));
    const workEnd = formatDate(formData.get('work-end'));
    const amount = formData.get('unpaid-amount') || '';
    const noticeDate = formatDate(formData.get('notice-date'));

    // Function to handle placeholder text
    function getValueOrPlaceholder(value, placeholder) {
        return value ? value : `[${placeholder}]`;
    }
    
    // Generate the appropriate HTML content based on form type
    let htmlContent = '';
    
    if (isLienForm) {
        // Mechanic's Lien form HTML content
        htmlContent = generateMechanicsLienHTML(formData, formValues);
    } else if (isReleaseForm) {
        // Release of Lien form HTML content
        htmlContent = generateReleaseLienHTML(formData, formValues);
    } else if (isDemandLetter) {
        // For demand letter, we use the function from demand-letter.js
        if (typeof createDemandLetterPrintView === 'function') {
            createDemandLetterPrintView(form);
            return; // Exit early as the demand letter function handles everything
        }
    }
    
    // Set the HTML content
    printContent.innerHTML = htmlContent;
    
    // Add the print content to the print view
    printView.appendChild(printContent);

    // Hide the form and show the print view
    form.style.display = 'none';
    printView.style.display = 'block';
    
    // Scroll to the print view
    printView.scrollIntoView({ behavior: 'smooth' });
}
