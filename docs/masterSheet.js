

// scrape nanopore directory for NANOSEQ_SampleSheet.json files
// pull info (data, flowcell, run name) into table

function populateTable() {
    fetch('/getMasterDB')
      .then(response => response.json())
      .then(rows => {
        const table = document.getElementById('nanoMasterDBTable');
  
        rows.forEach(row => {
          const { id, flowcell, run_date } = row;
          console.log(id)
          if (id.slice(0,3) == "TES") { return }
  
          const newRow = table.insertRow();
          const idCell = newRow.insertCell();
          const flowcellCell = newRow.insertCell();
          const dateCell = newRow.insertCell();
  
          idCell.innerHTML = id;
          flowcellCell.innerHTML = flowcell;
          dateCell.innerHTML = run_date;
        });
      })
      .catch(error => console.error(error));
  }

populateTable()

  