// Function to format date for the mechanic's lien form
function formatMechanicsLienDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Create the mechanic's lien print view
function createMechanicsLienPrintView(form) {
    console.log('Creating mechanic\'s lien print view...');
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
    
    // Add event listener for back to edit button
    previewHeader.querySelector('#back-to-edit-btn').addEventListener('click', function() {
        printView.style.display = 'none';
        form.style.display = 'block';
    });
    
    // Add the preview header to the print view
    printView.appendChild(previewHeader);
    
    // Get form data
    const formData = new FormData(form);
    const formValues = {};
    
    // Process form data
    formData.forEach((value, key) => {
        formValues[key] = value;
    });
    
    // Format dates
    const workStartDate = formatMechanicsLienDate(formValues['work-start']);
    const workEndDate = formatMechanicsLienDate(formValues['work-end']);
    const today = formatMechanicsLienDate(new Date().toISOString().split('T')[0]);
    
    // Calculate amount due
    const totalAmount = parseFloat(formValues['contract-amount'] || 0);
    const paidAmount = parseFloat(formValues['amount-paid'] || 0);
    const amountDue = totalAmount - paidAmount;
    const formattedAmountDue = amountDue.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    
    // Create a container for the document content with proper styling
    const documentContainer = document.createElement('div');
    documentContainer.className = 'letter-container';
    documentContainer.style.backgroundColor = '#fff';
    documentContainer.style.padding = '30px';
    documentContainer.style.border = '1px solid #ddd';
    documentContainer.style.borderRadius = '5px';
    // Remove box shadow to avoid gray background in print
    documentContainer.style.marginTop = '20px';
    documentContainer.style.marginBottom = '30px';
    documentContainer.style.maxWidth = '800px';
    documentContainer.style.margin = '20px auto';
    
    // Create print content
    const printContent = document.createElement('div');
    printContent.className = 'print-content';
    printContent.style.backgroundColor = '#fff';
    printContent.style.padding = '20px';
    printContent.style.marginTop = '20px';
    
    // Set the content of the mechanic's lien document
    printContent.innerHTML = `
        <div style="text-align: center; margin-bottom: 2em;">
            <h2>MECHANIC'S AND MATERIALMAN'S LIEN AFFIDAVIT</h2>
        </div>
        
        <div style="margin-bottom: 1em;">
            <strong>STATE OF TEXAS</strong><br>
            <strong>COUNTY OF ${formValues['property-county'] ? formValues['property-county'].toUpperCase() : ''}</strong>
        </div>
        
        <div style="margin-bottom: 1em; text-align: justify;">
            BEFORE ME, the undersigned authority, on this day personally appeared ${formValues['claimant-name'] || '[Claimant Name]'}, 
            who being by me duly sworn, upon oath states the following:
        </div>
        
        <div style="margin-bottom: 1em; text-align: justify;">
            1. My name is ${formValues['claimant-name'] || '[Claimant Name]'}. I am the owner of 
            ${formValues['business-name'] || '[Business Name]'} ("Claimant") located at 
            ${formValues['claimant-address'] || '[Claimant Address]'}, 
            ${formValues['claimant-city'] || '[City]'}, 
            ${formValues['claimant-state'] || '[State]'} 
            ${formValues['claimant-zip'] || '[ZIP]'}.
        </div>
        
        <div style="margin-bottom: 1em; text-align: justify;">
            2. Claimant furnished labor and/or materials for the improvement of the following described property in 
            ${formValues['property-county'] || '[County]'} County, Texas:
        </div>
        
        <div style="margin-bottom: 1em; text-align: justify; padding-left: 2em;">
            <strong>Legal Description:</strong> ${formValues['legal-description'] || '[Legal Description]'}<br>
            <strong>Property Address:</strong> ${formValues['property-address'] || '[Property Address]'}, 
            ${formValues['property-city'] || '[City]'}, 
            ${formValues['property-state'] || '[State]'} 
            ${formValues['property-zip'] || '[ZIP]'}
        </div>
        
        <div style="margin-bottom: 1em; text-align: justify;">
            3. The labor and/or materials were furnished under a contract with 
            ${formValues['customer-name'] || '[Customer Name]'}.
        </div>
        
        <div style="margin-bottom: 1em; text-align: justify;">
            4. The kind of work and/or materials furnished by Claimant was: 
            ${formValues['work-description'] || '[Work Description]'}.
        </div>
        
        <div style="margin-bottom: 1em; text-align: justify;">
            5. The work was performed and/or materials delivered during the time period from 
            ${workStartDate || '[Start Date]'} through ${workEndDate || '[End Date]'}.
        </div>
        
        <div style="margin-bottom: 1em; text-align: justify;">
            6. The name and last known address of the owner(s) or reputed owner(s) of the land and improvements is/are:
        </div>
        
        <div style="margin-bottom: 1em; text-align: justify; padding-left: 2em;">
            ${formValues['owner-name'] || '[Owner Name]'}<br>
            ${formValues['owner-address'] || '[Owner Address]'}<br>
            ${formValues['owner-city'] || '[City]'}, 
            ${formValues['owner-state'] || '[State]'} 
            ${formValues['owner-zip'] || '[ZIP]'}
        </div>
        
        <div style="margin-bottom: 1em; text-align: justify;">
            7. The name and address of the original contractor is:
        </div>
        
        <div style="margin-bottom: 1em; text-align: justify; padding-left: 2em;">
            ${formValues['contractor-name'] || '[Contractor Name]'}<br>
            ${formValues['contractor-address'] || '[Contractor Address]'}<br>
            ${formValues['contractor-city'] || '[City]'}, 
            ${formValues['contractor-state'] || '[State]'} 
            ${formValues['contractor-zip'] || '[ZIP]'}
        </div>
        
        <div style="margin-bottom: 1em; text-align: justify;">
            8. The original contract amount was $${parseFloat(formValues['contract-amount'] || 0).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}.
            The amount paid to date is $${parseFloat(formValues['amount-paid'] || 0).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}.
            The amount currently due and unpaid is $${formattedAmountDue}.
        </div>
        
        <div style="margin-bottom: 1em; text-align: justify;">
            9. All statutory notices required by the Texas Property Code have been sent to the owner and/or original contractor
            in the time and manner required.
        </div>
        
        <div style="margin-bottom: 2em; text-align: justify;">
            10. Claimant claims a lien against all the above described property and improvements thereon in the amount of 
            $${formattedAmountDue}, together with all interest, costs, and attorney's fees allowed by law.
        </div>
        
        <div style="margin-top: 3em;">
            <div style="margin-bottom: 1em;">
                <div style="border-bottom: 1px solid #000; width: 250px;"></div>
                ${formValues['claimant-name'] || '[Claimant Name]'}<br>
                ${formValues['business-name'] || '[Business Name]'}
            </div>
        </div>
        
        <div style="margin-top: 3em;">
            <div style="margin-bottom: 1em;">
                <strong>STATE OF TEXAS</strong><br>
                <strong>COUNTY OF ${formValues['claimant-county'] ? formValues['claimant-county'].toUpperCase() : ''}</strong>
            </div>
            
            <div style="margin-bottom: 1em; text-align: justify;">
                SUBSCRIBED AND SWORN TO BEFORE ME on ${today} by ${formValues['claimant-name'] || '[Claimant Name]'},
                to certify which witness my hand and official seal.
            </div>
            
            <div style="margin-top: 3em;">
                <div style="border-bottom: 1px solid #000; width: 250px;"></div>
                Notary Public, State of Texas
            </div>
        </div>
    `;
    
    // Append the print content to the document container
    documentContainer.appendChild(printContent);
    
    // Append the document container to the print view
    printView.appendChild(documentContainer);
    
    // Hide the form and show the print view
    form.style.display = 'none';
    printView.style.display = 'block';
    
    console.log('Print view displayed with content');
    
    // Scroll to the print view
    printView.scrollIntoView({ behavior: 'smooth' });
}

// Initialize mechanic's lien functionality when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded in mechanics-lien.js');
    
    // Add event listener for the mechanic's lien form submission
    const mechanicsLienForm = document.getElementById('mechanics-lien');
    console.log('Found mechanics lien form:', mechanicsLienForm);
    
    if (mechanicsLienForm) {
        // Add event listener directly to the submit button as well
        const submitButton = mechanicsLienForm.querySelector('button[type="submit"]');
        console.log('Found submit button:', submitButton);
        
        if (submitButton) {
            submitButton.addEventListener('click', function(event) {
                console.log('Submit button clicked');
                event.preventDefault();
                createMechanicsLienPrintView(mechanicsLienForm);
            });
        }
        
        mechanicsLienForm.addEventListener('submit', function(event) {
            console.log('Form submit event triggered');
            event.preventDefault();
            
            if (!this.checkValidity()) {
                event.stopPropagation();
                this.classList.add('was-validated');
                return;
            }
            
            console.log('Form is valid, creating print view');
            createMechanicsLienPrintView(this);
        });
    }
});
