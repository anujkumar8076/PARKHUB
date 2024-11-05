// core.js

document.addEventListener('DOMContentLoaded', () => {
    const entryForm = document.getElementById('entryForm');
    const editForm = document.getElementById('editForm');
    const parkingTableBody = document.getElementById('tableBody');
    const searchInput = document.getElementById('searchInput');
    const feedback = document.getElementById('feedback');
    const totalCars = document.getElementById('totalCars');
    const availableSpots = document.getElementById('availableSpots');
    const recentlyParked = document.getElementById('recentlyParked');
    
    // Define total parking spots (adjust as needed)
    const TOTAL_SPOTS = 100;
    
    let parkingData = [];
    let currentEditId = null;
    let sortOrder = {
      owner: 'asc',
      car: 'asc',
      licensePlate: 'asc',
      entryDate: 'asc',
      exitDate: 'asc'
    };
    
    // Initialize data from localStorage
    if (localStorage.getItem('parkingData')) {
      parkingData = JSON.parse(localStorage.getItem('parkingData'));
      renderTable(parkingData);
      updateDashboard();
    }
    
    // Form Submission - Add Car
    entryForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!entryForm.checkValidity()) {
        e.stopPropagation();
        entryForm.classList.add('was-validated');
        return;
      }
      
      const newEntry = {
        id: Date.now(),
        owner: document.getElementById('owner').value.trim(),
        car: document.getElementById('car').value.trim(),
        licensePlate: document.getElementById('licensePlate').value.trim().toUpperCase(),
        entryDate: document.getElementById('entryDate').value,
        exitDate: document.getElementById('exitDate').value
      };
      
      parkingData.push(newEntry);
      localStorage.setItem('parkingData', JSON.stringify(parkingData));
      renderTable(parkingData);
      updateDashboard();
      entryForm.reset();
      entryForm.classList.remove('was-validated');
      showFeedback('Car added successfully!', 'success');
    });
    
    // Render Table
    function renderTable(data) {
      parkingTableBody.innerHTML = '';
      data.forEach(entry => {
        const row = parkingTableBody.insertRow();
        
        row.insertCell(0).textContent = entry.owner;
        row.insertCell(1).textContent = entry.car;
        row.insertCell(2).textContent = entry.licensePlate;
        row.insertCell(3).textContent = formatDate(entry.entryDate);
        row.insertCell(4).textContent = entry.exitDate ? formatDate(entry.exitDate) : 'N/A';
        
        // Actions
        const actionsCell = row.insertCell(5);
        actionsCell.innerHTML = `
          <button class="btn btn-primary btn-sm edit-btn" data-id="${entry.id}" title="Edit Entry" aria-label="Edit Entry">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-danger btn-sm delete-btn" data-id="${entry.id}" title="Delete Entry" aria-label="Delete Entry">
            <i class="fas fa-trash-alt"></i>
          </button>
        `;
      });
    }
    
    // Format Date to Readable Format
    function formatDate(dateStr) {
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return new Date(dateStr).toLocaleDateString(undefined, options);
    }
    
    // Search Functionality
    searchInput.addEventListener('input', () => {
      const query = searchInput.value.toLowerCase();
      const filteredData = parkingData.filter(entry => 
        entry.owner.toLowerCase().includes(query) ||
        entry.car.toLowerCase().includes(query) ||
        entry.licensePlate.toLowerCase().includes(query) ||
        entry.entryDate.includes(query) ||
        (entry.exitDate && entry.exitDate.includes(query))
      );
      renderTable(filteredData);
    });
    
    // Sort Functionality
    document.querySelectorAll('#parkingTable th[data-sort]').forEach(header => {
      header.addEventListener('click', () => {
        const sortKey = header.getAttribute('data-sort');
        parkingData.sort((a, b) => {
          if (a[sortKey] < b[sortKey]) return sortOrder[sortKey] === 'asc' ? -1 : 1;
          if (a[sortKey] > b[sortKey]) return sortOrder[sortKey] === 'asc' ? 1 : -1;
          return 0;
        });
        sortOrder[sortKey] = sortOrder[sortKey] === 'asc' ? 'desc' : 'asc';
        renderTable(parkingData);
      });
    });
    
    // Handle Edit and Delete Buttons
    parkingTableBody.addEventListener('click', (e) => {
      if (e.target.closest('.edit-btn')) {
        const id = e.target.closest('.edit-btn').getAttribute('data-id');
        openEditModal(id);
      }
      
      if (e.target.closest('.delete-btn')) {
        const id = e.target.closest('.delete-btn').getAttribute('data-id');
        deleteEntry(id);
      }
    });
    
    // Open Edit Modal
    function openEditModal(id) {
      const entry = parkingData.find(item => item.id == id);
      if (!entry) return;
      
      currentEditId = id;
      document.getElementById('editOwner').value = entry.owner;
      document.getElementById('editCar').value = entry.car;
      document.getElementById('editLicensePlate').value = entry.licensePlate;
      document.getElementById('editEntryDate').value = entry.entryDate;
      document.getElementById('editExitDate').value = entry.exitDate;
      
      $('#editModal').modal('show');
    }
    
    // Edit Form Submission
    editForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!editForm.checkValidity()) {
        e.stopPropagation();
        editForm.classList.add('was-validated');
        return;
      }
      
      const updatedEntry = {
        id: currentEditId,
        owner: document.getElementById('editOwner').value.trim(),
        car: document.getElementById('editCar').value.trim(),
        licensePlate: document.getElementById('editLicensePlate').value.trim().toUpperCase(),
        entryDate: document.getElementById('editEntryDate').value,
        exitDate: document.getElementById('editExitDate').value
      };
      
      const index = parkingData.findIndex(item => item.id == currentEditId);
      if (index !== -1) {
        parkingData[index] = updatedEntry;
        localStorage.setItem('parkingData', JSON.stringify(parkingData));
        renderTable(parkingData);
        updateDashboard();
        $('#editModal').modal('hide');
        showFeedback('Entry updated successfully!', 'success');
        editForm.reset();
        editForm.classList.remove('was-validated');
      }
    });
    
    // Delete Entry
    function deleteEntry(id) {
      if (confirm('Are you sure you want to delete this entry?')) {
        parkingData = parkingData.filter(entry => entry.id != id);
        localStorage.setItem('parkingData', JSON.stringify(parkingData));
        renderTable(parkingData);
        updateDashboard();
        showFeedback('Entry deleted successfully!', 'danger');
      }
    }
    
    // Feedback Messages
    function showFeedback(message, type) {
      feedback.innerHTML = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
          ${message}
          <button type="button" class="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
      `;
      setTimeout(() => {
        $('.alert').alert('close');
      }, 3000);
    }
    
    // Update Dashboard Statistics
    function updateDashboard() {
      const total = parkingData.length;
      const recently = parkingData.length > 0 ? parkingData[parkingData.length - 1].id : 0;
      const available = TOTAL_SPOTS - total;
      
      totalCars.textContent = total;
      availableSpots.textContent = available >= 0 ? available : 0;
      recentlyParked.textContent = recently;
    }
  });
  