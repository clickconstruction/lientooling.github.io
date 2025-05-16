// Demand Letter functionality

// Test data for the demand letter form
const demandLetterTestData = {
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
};

// Format date for display
function formatDemandLetterDate(date) {
    if (!date) return '';
    const d = new Date(date);
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

// Create the demand letter print view
function createDemandLetterPrintView(form) {
    console.log('Creating demand letter print view...');
    const printView = document.getElementById('print-view');
    
    if (!printView) {
        console.error('Print view container not found!');
        return;
    }
    
    // Clear previous content
    printView.innerHTML = '';
    console.log('Cleared previous content');
    
    // Add some basic styling to the print view
    printView.style.backgroundColor = '#fff';
    printView.style.padding = '20px';
    printView.style.border = '1px solid #ddd';
    printView.style.borderRadius = '5px';
    printView.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
    
    // Create print preview header with print and back buttons
    const previewHeader = document.createElement('div');
    previewHeader.className = 'print-preview-header no-print';
    previewHeader.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-3">
            <h3>Print Preview</h3>
            <div>
                <button class="btn btn-secondary me-2" id="back-to-edit-btn">Back to Edit</button>
                <button class="btn btn-primary" onclick="window.print()">Print Document</button>
            </div>
        </div>
    `;
    printView.appendChild(previewHeader);
    
    // Add event listener for the Back to Edit button
    const backToEditBtn = previewHeader.querySelector('#back-to-edit-btn');
    if (backToEditBtn) {
        backToEditBtn.addEventListener('click', function() {
            // Hide print view and show form
            printView.style.display = 'none';
            form.style.display = 'block';
        });
    }
    
    // Create print content
    const printContent = document.createElement('div');
    printContent.className = 'print-content';
    printContent.style.backgroundColor = '#fff';
    printContent.style.padding = '20px';
    printContent.style.marginTop = '20px';
    printContent.style.border = '1px solid #ddd';
    printContent.style.borderRadius = '5px';
    
    // Get form data
    const formData = new FormData(form);
    const formValues = {};
    
    // Process form data
    formData.forEach((value, key) => {
        formValues[key] = value;
    });
    
    // Manually check checkbox values
    const checkboxes = form.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        formValues[checkbox.name] = checkbox.checked ? 'on' : 'off';
    });
    
    // Format the current date
    const today = new Date();
    const formattedToday = formatDemandLetterDate(today.toISOString().split('T')[0]);
    
    // Calculate outstanding balance with proper formatting
    const outstandingBalance = parseFloat(formValues['outstanding-balance']).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    
    printContent.innerHTML = `
        <div style="text-align: right; margin-bottom: 1em;">
            <strong>${formValues['business-name']}</strong><br>
            ${formValues['sender-name']}<br>
            ${formValues['business-address']}<br>
            ${formValues['business-city']}, ${formValues['business-state']} ${formValues['business-zip']}<br>
            ${formValues['business-phone']}<br>
            ${formValues['business-email']}
        </div>
        
        <div style="margin-bottom: 1em;">
            <strong>Date:</strong> ${formattedToday}
        </div>
        
        <div style="margin-bottom: 2em;">
            <strong>TO:</strong><br>
            ${formValues['client-name']}<br>
            ${formValues['client-address']}<br>
            ${formValues['client-city']}, ${formValues['client-state']} ${formValues['client-zip']}
        </div>
        
        <div style="margin-bottom: 2em;">
            <strong>Re: Final Demand for Payment – Invoice #${formValues['invoice-number']}</strong>
        </div>
        
        <div style="margin-bottom: 1em;">
            Dear ${formValues['client-name']},
        </div>
        
        <div style="margin-bottom: 1em; text-align: justify;">
            This letter serves as a <strong>final formal demand for payment</strong> in the amount of <strong>$${outstandingBalance}</strong> for services rendered by ${formValues['business-name']} on or about <strong>${formValues['service-dates']}</strong>, as agreed upon between the parties. Despite prior communication, this balance remains unpaid.
        </div>
        
        <div style="margin-bottom: 2em;">
            <h3>Details of Debt:</h3>
            <ul>
                <li><strong>Service Provided:</strong> ${formValues['service-description']}</li>
                <li><strong>Date of Completion:</strong> ${formatDemandLetterDate(formValues['completion-date'])}</li>
                <li><strong>Invoice Total:</strong> $${parseFloat(formValues['invoice-total']).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</li>
                <li><strong>Payments Received:</strong> $${parseFloat(formValues['payments-received']).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</li>
                <li><strong>Outstanding Balance:</strong> $${outstandingBalance}</li>
            </ul>
        </div>
        
        <div style="margin-bottom: 1em; text-align: justify;">
            You were invoiced on <strong>${formatDemandLetterDate(formValues['invoice-date'])}</strong> with payment due on <strong>${formatDemandLetterDate(formValues['due-date'])}</strong>. To date, we have made good-faith efforts to resolve this matter without escalation, including previous notices and attempts to contact you regarding the balance due.
        </div>
        
        <div style="margin: 2em 0; border-top: 1px solid #ccc; border-bottom: 1px solid #ccc; padding: 1em 0;">
            <h3>Demand</h3>
            <p>
                Unless payment in full is received by <strong>${formatDemandLetterDate(formValues['payment-deadline'])}</strong>, we will pursue <strong>all legal remedies available</strong>, including but not limited to:
            </p>
            <ul>
                <li>Filing a <strong>theft of services report</strong> with local law enforcement under <strong>Texas Penal Code § 31.04</strong></li>
                <li>Initiating a <strong>small claims lawsuit</strong></li>
                <li>Filing a <strong>mechanic's lien</strong> (if applicable under Chapter 53 of the Texas Property Code)</li>
            </ul>
        </div>
        
        <div style="margin-bottom: 2em; text-align: justify;">
            We would prefer to resolve this matter without legal action. Please treat this letter as a final opportunity to remit payment voluntarily.
        </div>
        
        <div style="margin-bottom: 2em; text-align: justify;">
            ${formValues['payment-method']} If you believe this balance is incorrect or disputed, you must notify us in writing <strong>before the deadline above</strong>.
        </div>
        
        <div style="margin-bottom: 2em; text-align: justify;">
            <strong>Note:</strong> Per our agreement, late fees and interest may continue to accrue on the unpaid balance until payment is received in full.
        </div>
        
        <div style="margin-top: 3em;">
            Sincerely,
            <div style="margin-top: 2em;">
                <div class="signature-line"></div>
                <strong>${formValues['sender-name']}</strong><br>
                ${formValues['business-name']}<br>
                ${formValues['business-phone']}<br>
                ${formValues['business-email']}
            </div>
        </div>
        
        ${formValues['include-notarial'] === 'on' ? `
        <div style="margin-top: 4em; border-top: 1px solid #ccc; padding-top: 1em;">
            <p>STATE OF TEXAS<br>
            COUNTY OF ${formValues['client-county'].toUpperCase()}</p>
            
            <p>SWORN TO AND SUBSCRIBED BEFORE ME on this _____ day of _____________, ${new Date().getFullYear()}, by ${formValues['sender-name']}.</p>
            
            <div style="margin-top: 2em;">
                ________________________________<br>
                Notary Public, State of Texas
            </div>
        </div>
        ` : ''}
    `;
    
    // Create a container for the letter content with proper styling
    const letterContainer = document.createElement('div');
    letterContainer.className = 'letter-container';
    letterContainer.style.backgroundColor = '#fff';
    letterContainer.style.padding = '30px';
    letterContainer.style.border = '1px solid #ddd';
    letterContainer.style.borderRadius = '5px';
    // Remove box shadow to avoid gray background in print
    letterContainer.style.marginTop = '20px';
    letterContainer.style.marginBottom = '30px';
    letterContainer.style.maxWidth = '800px';
    letterContainer.style.margin = '20px auto';
    
    // Append the print content to the letter container
    letterContainer.appendChild(printContent);
    
    // Append the letter container to the print view
    printView.appendChild(letterContainer);
    
    // Hide the form and show the print view
    form.style.display = 'none';
    printView.style.display = 'block';
    
    console.log('Print view displayed with content');
    
    // Scroll to the print view
    printView.scrollIntoView({ behavior: 'smooth' });
}

// Function to fill the demand letter form with test data
function fillDemandLetterWithTestData() {
    const form = document.getElementById('demand-letter');
    
    // Simple approach - directly set values by name attribute
    Object.keys(demandLetterTestData).forEach(key => {
        const input = form.querySelector(`[name="${key}"]`);
        if (input) {
            if (input.type === 'checkbox' && demandLetterTestData[key] === true) {
                input.checked = true;
            } else {
                input.value = demandLetterTestData[key];
            }
        }
    });

    // Mark form as touched for validation
    form.classList.add('was-validated');
}

// Initialize demand letter functionality when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded in demand-letter.js');
    
    // Add event listener for the demand letter form submission
    const demandLetterForm = document.getElementById('demand-letter');
    console.log('Found demand letter form:', demandLetterForm);
    
    if (demandLetterForm) {
        // Add event listener directly to the submit button as well
        const submitButton = demandLetterForm.querySelector('button[type="submit"]');
        console.log('Found submit button:', submitButton);
        
        if (submitButton) {
            submitButton.addEventListener('click', function(event) {
                console.log('Submit button clicked');
                event.preventDefault();
                createDemandLetterPrintView(demandLetterForm);
            });
        }
        
        demandLetterForm.addEventListener('submit', function(event) {
            console.log('Form submit event triggered');
            event.preventDefault();
            
            if (!this.checkValidity()) {
                event.stopPropagation();
                this.classList.add('was-validated');
                
                // Find all invalid fields
                const invalidFields = this.querySelectorAll(':invalid');
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
            
            console.log('Form submitted, generating print view...');
            
            // Add a back to edit button to the form
            const backToEditBtn = document.createElement('button');
            backToEditBtn.textContent = 'Back to Edit';
            backToEditBtn.className = 'btn btn-secondary me-2';
            backToEditBtn.type = 'button';
            backToEditBtn.addEventListener('click', function() {
                document.getElementById('print-view').style.display = 'none';
                document.getElementById('demand-letter').style.display = 'block';
            });
            
            // Create the print view
            createDemandLetterPrintView(this);
            
            // Add the back button to the print view
            const printView = document.getElementById('print-view');
            if (printView && printView.firstChild) {
                const buttonContainer = printView.querySelector('.d-flex');
                if (buttonContainer) {
                    buttonContainer.insertBefore(backToEditBtn, buttonContainer.firstChild);
                }
            }
            
            console.log('Print view should be displayed now');
            console.log('Print view display style:', document.getElementById('print-view').style.display);
        });
    }
});
