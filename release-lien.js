// Function to format date for the release of lien form
function formatReleaseDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Create the release of lien print view
function createReleasePrintView(form) {
    console.log('Creating release of lien print view...');
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
        <div style="display: flex; width: 100%;">
            <div style="flex: 1; text-align: left;">
                <h3>Print Preview</h3>
            </div>
            <div style="text-align: right;">
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
    
    // Format the current date
    const today = new Date();
    const formattedToday = formatReleaseDate(today.toISOString().split('T')[0]);
    
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
    
    // Create print content
    const printContent = document.createElement('div');
    printContent.className = 'print-content';
    printContent.style.backgroundColor = '#fff';
    printContent.style.padding = '20px';
    printContent.style.marginTop = '20px';
    
    // Set the content of the release of lien document
    printContent.innerHTML = `
        <div style="text-align: center; margin-bottom: 2em;">
            <h2>RELEASE OF MECHANIC'S LIEN</h2>
        </div>
        
        <div style="margin-bottom: 1em;">
            <strong>STATE OF TEXAS</strong><br>
            <strong>COUNTY OF ${formValues['property-county'] ? formValues['property-county'].toUpperCase() : ''}</strong>
        </div>
        
        <div style="margin-bottom: 1em; text-align: justify;">
            KNOW ALL MEN BY THESE PRESENTS:
        </div>
        
        <div style="margin-bottom: 1em; text-align: justify;">
            THAT WHEREAS, the undersigned, ${formValues['claimant-name'] || '[Claimant Name]'}, whose address is 
            ${formValues['claimant-address'] || '[Claimant Address]'}, 
            ${formValues['claimant-city'] || '[City]'}, 
            ${formValues['claimant-state'] || '[State]'} 
            ${formValues['claimant-zip'] || '[ZIP]'}, 
            did file a Mechanic's and Materialman's Lien against 
            ${formValues['owner-name'] || '[Owner Name]'}, 
            in the amount of $${formValues['lien-amount'] || '0.00'}, 
            said lien being filed on ${formatReleaseDate(formValues['filing-date']) || '[Filing Date]'}, 
            and recorded in the Official Public Records of ${formValues['property-county'] || '[County]'} County, Texas.
        </div>
        
        <div style="margin-bottom: 1em; text-align: justify;">
            NOW THEREFORE, in consideration of the payment of the indebtedness secured by said lien, the receipt of which is hereby acknowledged, the undersigned does hereby release the aforementioned Mechanic's and Materialman's Lien on the following described property:
        </div>
        
        <div style="margin-bottom: 2em; text-align: justify; padding-left: 2em;">
            ${formValues['property-description'] || '[Property Description]'}<br>
            Address: ${formValues['property-address'] || '[Property Address]'}, 
            ${formValues['property-city'] || '[City]'}, 
            ${formValues['property-state'] || '[State]'} 
            ${formValues['property-zip'] || '[ZIP]'}
        </div>
        
        <div style="margin-bottom: 2em; text-align: justify;">
            IN WITNESS WHEREOF, this Release of Mechanic's Lien has been executed this ${formattedToday}.
        </div>
        
        <div style="margin-top: 3em;">
            <div style="margin-bottom: 1em;">
                <div style="border-bottom: 1px solid #000; width: 250px;"></div>
                ${formValues['claimant-name'] || '[Claimant Name]'}<br>
                ${formValues['company-name'] || formValues['business-name'] || '[Company Name]'}
            </div>
        </div>
        
        <div style="margin-top: 4em;">
            <p>STATE OF TEXAS<br>
            COUNTY OF ___________</p>
            
            <p>SWORN TO AND SUBSCRIBED BEFORE ME on this _____ day of _____________, ${new Date().getFullYear()}, by ${formValues['claimant-name'] || '[Claimant Name]'}.</p>
            
            <div style="margin-top: 2em;">
                ________________________________<br>
                Notary Public, State of Texas
            </div>
        </div>
    `;
    
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

// Initialize release of lien functionality when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Release of lien script loaded');
    const releaseForm = document.getElementById('release-lien');
    const testDataBtn = document.getElementById('test-data-btn');
    
    // Add test data functionality
    if (testDataBtn) {
        testDataBtn.addEventListener('click', function() {
            console.log('Filling test data for release of lien form');

            // Fill claimant information
            document.querySelector('input[name="claimant-name"]').value = 'John Smith';
            document.querySelector('input[name="business-name"]').value = 'Smith Construction LLC';
            document.querySelector('input[name="claimant-address"]').value = '123 Main St';
            document.querySelector('input[name="claimant-city"]').value = 'Austin';
            document.querySelector('input[name="claimant-state"]').value = 'TX';
            document.querySelector('input[name="claimant-zip"]').value = '78701';
            
            // Fill lien information
            document.querySelector('input[name="filing-date"]').value = '2025-04-15';
            
            // Fill property information
            document.querySelector('textarea[name="property-description"]').value = 'Lot 7, Block B, Westlake Hills Section 3, a subdivision in Travis County, Texas, according to the map or plat thereof recorded in Volume 58, Page 71 of the Plat Records of Travis County, Texas.';
            document.querySelector('input[name="owner-name"]').value = 'Alice Johnson';
            document.querySelector('input[name="property-county"]').value = 'Travis';
            document.querySelector('input[name="property-address"]').value = '456 Oak Ave';
            document.querySelector('input[name="property-city"]').value = 'Austin';
            document.querySelector('input[name="property-state"]').value = 'TX';
            document.querySelector('input[name="property-zip"]').value = '78704';
        });
    }
    
    if (releaseForm) {
        const submitButton = releaseForm.querySelector('button[type="submit"]');
        console.log('Found submit button:', submitButton);
        
        if (submitButton) {
            submitButton.addEventListener('click', function(event) {
                console.log('Submit button clicked');
                event.preventDefault();
                createReleasePrintView(releaseForm);
            });
        }
        
        releaseForm.addEventListener('submit', function(event) {
            console.log('Form submit event triggered');
            event.preventDefault();
            
            if (!this.checkValidity()) {
                event.stopPropagation();
                this.classList.add('was-validated');
                return;
            }
            
            console.log('Form is valid, creating print view');
            createReleasePrintView(this);
        });
    }
});
