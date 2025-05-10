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
    
    // Simple approach - directly set values by name attribute
    Object.keys(data).forEach(key => {
        const input = form.querySelector(`[name="${key}"]`);
        if (input) {
            input.value = data[key];
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
    
    // Add automatic lookup on blur for Release of Lien form - Claimant Information
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
    propertyCityInput.addEventListener('blur', function() { /* Same auto-lookup logic */ });
    propertyStateInput.addEventListener('blur', function() { /* Same auto-lookup logic */ });
    propertyZipInput.addEventListener('blur', function() { /* Same auto-lookup logic */ });
    
    // Form navigation
    const navLinks = document.querySelectorAll('.nav-link');
    const forms = {
        'mechanics-lien': document.getElementById('mechanics-lien'),
        'release-lien': document.getElementById('release-lien')
    };

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const formId = link.getAttribute('data-form');
            
            // Update navigation
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            // Show selected form and hide print view
            Object.keys(forms).forEach(key => {
                forms[key].style.display = key === formId ? 'block' : 'none';
            });
            
            // Hide the print view when switching tabs
            const printView = document.getElementById('print-view');
            if (printView) {
                printView.style.display = 'none';
                printView.innerHTML = ''; // Clear the content
            }
        });
    });

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
    // Test data button handler
    const testDataBtn = document.getElementById('test-data-btn');
    testDataBtn.addEventListener('click', () => {
        // Find which form is currently visible
        const activeFormId = document.querySelector('.nav-link.active').getAttribute('data-form');
        fillFormWithTestData(activeFormId);
    });

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
    });
});

function formatDate(date) {
    if (!date) return '';
    const d = new Date(date);
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function createPrintView(form) {
    console.log('Creating print view for form:', form.id);
    // Create print view container if it doesn't exist
    let printView = document.getElementById('print-view');
    if (!printView) {
        printView = document.createElement('div');
        printView.id = 'print-view';
        printView.className = 'print-view';
        document.body.appendChild(printView);
    }

    // Generate print view content
    const isLienForm = form.id === 'mechanics-lien';
    const isReleaseForm = form.id === 'release-lien';
    const title = isLienForm ? "Mechanic's Lien Form" : "Release of Lien Form";
    const today = new Date().toLocaleDateString();

    const formData = new FormData(form);
    
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
    
    // Hide all other elements when showing print view
    document.querySelectorAll('.container > *:not(#print-view)').forEach(el => {
        el.classList.add('no-print');
    });
    
    // Hide the test data button when showing preview
    const testDataBtn = document.getElementById('test-data-btn');
    if (testDataBtn) {
        testDataBtn.style.display = 'none';
    }
    
    printView.innerHTML = `
        <div class="print-preview-header no-print">
            <h2>${isLienForm ? "Mechanic's Lien Preview" : "Release of Lien Preview"}</h2>
            <div class="preview-buttons">
                <button id="edit-form-btn" class="btn btn-secondary">Edit</button>
                <button onclick="window.print()" class="btn btn-primary">Print Form</button>
            </div>
        </div>

        <div class="document-header">
            <div class="document-header-left">
                <div class="header-title">This instrument was prepared by:</div>
                <div class="header-value">${getValueOrPlaceholder(claimantName, 'Claimant\'s Full Legal Name')}</div>
                <div class="header-value">${getValueOrPlaceholder(formData.get('claimant-address'), 'Claimant\'s Address')}</div>
                <div class="header-value">${getValueOrPlaceholder(formData.get('claimant-city'), 'City')}, ${getValueOrPlaceholder(formData.get('claimant-state'), 'State')} ${getValueOrPlaceholder(formData.get('claimant-zip'), 'ZIP')}</div>
                
                <div class="header-title">Once recorded, return to:</div>
                <div class="header-value">${getValueOrPlaceholder(claimantName, 'Claimant\'s Full Legal Name')}</div>
                <div class="header-value">${getValueOrPlaceholder(formData.get('claimant-address'), 'Claimant\'s Address')}</div>
                <div class="header-value">${getValueOrPlaceholder(formData.get('claimant-city'), 'City')}, ${getValueOrPlaceholder(formData.get('claimant-state'), 'State')} ${getValueOrPlaceholder(formData.get('claimant-zip'), 'ZIP')}</div>
            </div>
            <div class="document-header-right">
                <p>This Space for Recorder's Use Only.</p>
            </div>
        </div>

        ${isLienForm ? `
        <div class="legal-header">
            MECHANIC'S AND MATERIALMAN'S LIEN AFFIDAVIT
        </div>
        <div class="legal-subheader">
            (Texas Property Code § 53.052)
        </div>
        ` : `
        <div class="legal-header">
            RELEASE OF MECHANIC'S LIEN
        </div>
        `}

        ${isLienForm ? `
        <div class="state-county">
            State of Texas<br>
            County of ${getValueOrPlaceholder(county, 'Property County')}
        </div>

        <div class="before-me">
            BEFORE ME, the undersigned authority, on this day personally appeared:
        </div>

        <p><strong>${getValueOrPlaceholder(claimantName, 'Claimant\'s Full Legal Name')}</strong>${companyName ? `, doing business as <strong>${companyName}</strong>` : ''}, whose address is <strong>${getValueOrPlaceholder(claimantAddress, 'Mailing Address')}</strong>, and who, being by me duly sworn, did depose and state the following:</p>

        <div class="numbered-section">
            <h3>1. Claimant Information:</h3>
            <div class="section-content">
                I performed labor and/or furnished materials for the improvement of the property described below.
            </div>
        </div>

        <div class="numbered-section">
            <h3>2. Owner of the Property:</h3>
            <div class="section-content">
                <strong>${getValueOrPlaceholder(ownerName, 'Full Legal Name of Property Owner')}</strong><br>
                ${getValueOrPlaceholder(propertyAddress, 'Property Owner\'s Address, City, State, ZIP')}
            </div>
        </div>

        <div class="numbered-section">
            <h3>3. Original Contractor (if not the same as Claimant):</h3>
            <div class="section-content">
                ${companyName || '[Not Applicable]'}
            </div>
        </div>

        <div class="numbered-section">
            <h3>4. Property Description:</h3>
            <div class="section-content">
                ${getValueOrPlaceholder(propertyDescription, 'Legal Description OR Street Address')},<br>
                situated in ${getValueOrPlaceholder(county, 'Property County')} County, Texas.
            </div>
        </div>

        <div class="numbered-section">
            <h3>5. Work Description:</h3>
            <div class="section-content">
                The work consisted of:<br>
                ${getValueOrPlaceholder(workDescription, 'Description of Work Performed')}
            </div>
        </div>

        <div class="numbered-section">
            <h3>6. Dates of Work:</h3>
            <div class="section-content">
                First furnished on: <strong>${getValueOrPlaceholder(workStart, 'Start Date')}</strong><br>
                Last furnished on: <strong>${getValueOrPlaceholder(workEnd, 'End Date')}</strong>
            </div>
        </div>

        <div class="numbered-section">
            <h3>7. Unpaid Amount:</h3>
            <div class="section-content">
                The total amount due and unpaid is <strong>$${getValueOrPlaceholder(amount, 'Amount')}</strong>.
            </div>
        </div>

        <div class="numbered-section">
            <h3>8. Notice:</h3>
            <div class="section-content">
                I sent all required notices under Texas Property Code § 53.056, including notice to the owner and general contractor (if applicable), via certified mail on <strong>${getValueOrPlaceholder(noticeDate, 'Notice Date')}</strong>.
            </div>
        </div>

        <div class="numbered-section">
            <h3>9. Affidavit Filing:</h3>
            <div class="section-content">
                I file this lien claim in accordance with Texas Property Code Chapter 53, and respectfully request it be recorded against the property described above.
            </div>
        </div>

        <p>FURTHER AFFIANT SAYETH NOT.</p>

        <div class="signature-section">
            <div class="signature-line"></div>
            <p><strong>${getValueOrPlaceholder(claimantName, 'Claimant\'s Full Legal Name')}</strong><br>
            ${companyName || ''}</p>
        </div>

        <div class="notary-section">
            <p class="state-county-signature">
                STATE OF ________________<br>
                COUNTY OF ______________
            </p><p>On this _____ day of _______________, ${new Date().getFullYear()}, before me, 
            __________________________________, a Notary Public, personally appeared <strong>${getValueOrPlaceholder(claimantName, 'Claimant\'s Full Legal Name')}</strong>, known to me to be the person whose name is subscribed to the within instrument and acknowledged to me that ${claimantName.includes('Ms.') ? 'she' : 'he'} executed the same in ${claimantName.includes('Ms.') ? 'her' : 'his'} authorized capacity, and that by ${claimantName.includes('Ms.') ? 'her' : 'his'} signature on the instrument, ${claimantName.includes('Ms.') ? 'she' : 'he'} executed the instrument.</p>
            <p>IN WITNESS WHEREOF, I hereunto set my hand and official seal.</p>
            <div class="signature-line"></div>
            <p>Notary Public<br>
            My Commission Expires: _______________</p>
        </div>
        ` : `
        <div class="state-county">
            State of Texas<br>
            County of ${getValueOrPlaceholder(county, 'Property County')}
        </div>

        <div class="release-content">
            <p class="know-all">KNOW ALL MEN BY THESE PRESENTS:</p>

            <p>That I, <strong>${getValueOrPlaceholder(claimantName, 'Claimant\'s Full Legal Name')}</strong>${companyName ? `, of <strong>${companyName}</strong>` : ''}, the undersigned lien claimant, do hereby acknowledge that the claim and lien filed by me on <strong>${getValueOrPlaceholder(formData.get('payment-date'), 'Date')}</strong>, and recorded in the Official Public Records of <strong>${getValueOrPlaceholder(county, 'Property County')}</strong> County, Texas under Document Number <strong>${getValueOrPlaceholder(formData.get('lien-reference'), 'Document Number')}</strong>, against the property legally described as:</p>

            <p class="indented">${getValueOrPlaceholder(formData.get('property-description'), 'Property Description')}</p>

            <p>and owned by <strong>${getValueOrPlaceholder(ownerName, 'Full Legal Name of Property Owner')}</strong>, has been fully paid and satisfied, and I do hereby release and discharge said lien.</p>
        </div>

        <div class="signature-section">
            <div class="signature-line"></div>
            <p><strong>${getValueOrPlaceholder(claimantName, 'Claimant\'s Full Legal Name')}</strong><br>
            ${companyName || ''}</p>
        </div>

        <div class="notary-section">
            <p class="state-county-signature">
                STATE OF ________________<br>
                COUNTY OF ______________
            </p><p>On this _____ day of _______________, ${new Date().getFullYear()}, before me, 
            __________________________________, a Notary Public, personally appeared <strong>${getValueOrPlaceholder(claimantName, 'Claimant\'s Full Legal Name')}</strong>, known to me to be the person whose name is subscribed to the within instrument and acknowledged to me that ${claimantName.includes('Ms.') ? 'she' : 'he'} executed the same in ${claimantName.includes('Ms.') ? 'her' : 'his'} authorized capacity, and that by ${claimantName.includes('Ms.') ? 'her' : 'his'} signature on the instrument, ${claimantName.includes('Ms.') ? 'she' : 'he'} executed the instrument.</p>
            <p>IN WITNESS WHEREOF, I hereunto set my hand and official seal.</p>
            <div class="signature-line"></div>
            <p>Notary Public<br>
            My Commission Expires: _______________</p>
        </div>
        `}
    `;

    // Hide the form and show the print view
    form.style.display = 'none';
    printView.style.display = 'block';

    // Add event listener for the Edit button
    setTimeout(() => {
        const editButton = document.getElementById('edit-form-btn');
        if (editButton) {
            editButton.addEventListener('click', () => {
                form.style.display = 'block';
                printView.style.display = 'none';
                
                // Show the test data button again
                const testDataBtn = document.getElementById('test-data-btn');
                if (testDataBtn) {
                    testDataBtn.style.display = 'block';
                }
            });
        }
    }, 100);
    
    // Add a back button (keeping for backward compatibility)
    const backButton = document.createElement('button');
    backButton.className = 'btn btn-secondary mt-4 no-print';
    backButton.textContent = 'Back to Form';
    backButton.onclick = () => {
        form.style.display = 'block';
        printView.style.display = 'none';
        
        // Show the test data button again
        const testDataBtn = document.getElementById('test-data-btn');
        if (testDataBtn) {
            testDataBtn.style.display = 'block';
        }
    };
    printView.appendChild(backButton);
}
