document.addEventListener('DOMContentLoaded', function() {
    const studentsTableBody = document.getElementById('studentsTableBody');
    const studentForm = document.getElementById('studentForm');
    const studentModal = new bootstrap.Modal(document.getElementById('studentModal'));
    const saveStudentBtn = document.getElementById('saveStudentBtn');
    const addStudentBtn = document.getElementById('addStudentBtn');
    
    let currentStudentId = null;
  
    // Load students when page loads
    loadStudents();
  
    // Add student button click
    addStudentBtn.addEventListener('click', () => {
      currentStudentId = null;
      document.getElementById('modalTitle').textContent = 'Add Student';
      studentForm.reset();
      studentModal.show();
    });
  
    // Save student (both add and edit)
    saveStudentBtn.addEventListener('click', async () => {
      const studentData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        course: document.getElementById('course').value,
        joiningDate: document.getElementById('joiningDate').value,
        feesPaid: document.getElementById('feesPaid').checked,
        address: document.getElementById('address').value
      };
  
      try {
        if (currentStudentId) {
          // Update existing student
          await fetch(`/api/students/${currentStudentId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(studentData)
          });
        } else {
          // Add new student
          await fetch('/api/students', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(studentData)
          });
        }
        
        studentModal.hide();
        loadStudents();
      } catch (err) {
        console.error('Error saving student:', err);
        alert('Error saving student. Please try again.');
      }
    });
  
    // Load all students
    async function loadStudents() {
      try {
        const response = await fetch('/api/students');
        const students = await response.json();
        
        studentsTableBody.innerHTML = '';
        
        students.forEach(student => {
          const row = document.createElement('tr');
          
          row.innerHTML = `
            <td>${student.name}</td>
            <td>${student.email}</td>
            <td>${student.phone}</td>
            <td>${student.course}</td>
            <td>${new Date(student.joiningDate).toLocaleDateString()}</td>
            <td>${student.feesPaid ? 'Yes' : 'No'}</td>
            <td class="action-btns">
              <button class="btn btn-sm btn-warning me-2 edit-btn" data-id="${student._id}">
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn btn-sm btn-danger delete-btn" data-id="${student._id}">
                <i class="fas fa-trash"></i>
              </button>
            </td>
          `;
          
          studentsTableBody.appendChild(row);
        });
  
        // Add event listeners to edit buttons
        document.querySelectorAll('.edit-btn').forEach(btn => {
          btn.addEventListener('click', async (e) => {
            const studentId = e.currentTarget.getAttribute('data-id');
            await loadStudentForEdit(studentId);
          });
        });
  
        // Add event listeners to delete buttons
        document.querySelectorAll('.delete-btn').forEach(btn => {
          btn.addEventListener('click', async (e) => {
            const studentId = e.currentTarget.getAttribute('data-id');
            if (confirm('Are you sure you want to delete this student?')) {
              await deleteStudent(studentId);
            }
          });
        });
  
      } catch (err) {
        console.error('Error loading students:', err);
      }
    }
  
    // Load student data for editing
    async function loadStudentForEdit(studentId) {
      try {
        const response = await fetch(`/api/students/${studentId}`);
        const student = await response.json();
        
        currentStudentId = studentId;
        document.getElementById('modalTitle').textContent = 'Edit Student';
        document.getElementById('name').value = student.name;
        document.getElementById('email').value = student.email;
        document.getElementById('phone').value = student.phone;
        document.getElementById('course').value = student.course;
        document.getElementById('joiningDate').value = student.joiningDate.split('T')[0];
        document.getElementById('feesPaid').checked = student.feesPaid;
        document.getElementById('address').value = student.address || '';
        
        studentModal.show();
      } catch (err) {
        console.error('Error loading student:', err);
      }
    }
  
    // Delete student
    async function deleteStudent(studentId) {
      try {
        await fetch(`/api/students/${studentId}`, {
          method: 'DELETE'
        });
        loadStudents();
      } catch (err) {
        console.error('Error deleting student:', err);
      }
    }
  });