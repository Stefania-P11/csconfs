import React, { useState, useEffect } from 'react';
import FormControlLabel from '@mui/material/FormControlLabel';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Collapse from '@mui/material/Collapse';
import Checkbox from '@mui/material/Checkbox';
import Papa from 'papaparse';
import yaml from 'js-yaml';

import ConferenceCard from './ConferenceCard';
import logo2 from './t-rex.gif';
import './App.css';

const parentAreaColors = [
  '#1f77b4',  // blue
  '#ff7f0e',  // orange
  '#2ca02c',  // green
  '#9467bd',  // purple
  '#d62728',  // red
  '#8c564b',  // brown
  '#e377c2',  // pink
  '#7f7f7f',  // gray
  '#bcbd22',  // olive
  '#17becf',  // cyan
];

function App() {
  const [conferences, setConferences] = useState([]);
  const [filteredConferences, setFilteredConferences] = useState([]);
  const [areas, setAreas] = useState({});
  const [selectedConferences, setSelectedConferences] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [conferencesByArea, setConferencesByArea] = useState({});
  
  const [openParents, setOpenParents] = useState({});
  const [openAreas, setOpenAreas] = useState({});
  
  const toggleParent = (parentArea) => {
    setOpenParents(prev => ({ ...prev, [parentArea]: !prev[parentArea] }));
  };
  
  const toggleArea = (areaTitle) => {
    setOpenAreas(prev => ({ ...prev, [areaTitle]: !prev[areaTitle] }));
  };

  // Given ParentArea name, get all conferences under it
  const getConferencesByParentArea = (parentArea) => {
    let confs = [];
    const areaDetails = areas[parentArea] || [];
    areaDetails.forEach(({ area_title }) => {
      confs = confs.concat(conferencesByArea[area_title] || []);
    });
    return confs;
  };

  // Given Area title, get all conferences under it
  const getConferencesByAreaTitle = (areaTitle) => {
    return conferencesByArea[areaTitle] || [];
  };

  // Check if all conferences in list are selected
  const isAllSelected = (confList) => {
    return confList.length > 0 && confList.every(c => selectedConferences.has(c));
  };

  // Check if some (but not all) selected for indeterminate state
  const isSomeSelected = (confList) => {
    return confList.some(c => selectedConferences.has(c)) && !isAllSelected(confList);
  };

  // Toggle multiple conferences at once: select or deselect all in confList
  const toggleMultipleConferences = (confList, select) => {
    const updatedSelected = new Set(selectedConferences);
    confList.forEach(confName => {
      if (select) updatedSelected.add(confName);
      else updatedSelected.delete(confName);
    });
    setSelectedConferences(updatedSelected);
  };


  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch and parse YAML data
        const yamlResponse = await fetch('/csconfs/data/conferences.yaml');
        const yamlText = await yamlResponse.text();
        const loadedConferences = yaml.load(yamlText) || [];

        // Fetch and parse CSV data
        const csvResponse = await fetch('/csconfs/data/conferences.csv');
        const csvText = await csvResponse.text();

        Papa.parse(csvText, {
          header: true,
          complete: (results) => {
            const areasMap = {};
            const conferencesMap = {};

            results.data.forEach(row => {
              const areaTitle = row.AreaTitle;
              const parentArea = row.ParentArea || "Other";

              if (!areasMap[parentArea]) {
                areasMap[parentArea] = [];
              }

              if (!areasMap[parentArea].some(area => area.area_title === areaTitle)) {
                areasMap[parentArea].push({
                  area: row.Area,
                  area_title: areaTitle
                });
              }

              if (!conferencesMap[areaTitle]) {
                conferencesMap[areaTitle] = new Set();
              }

              conferencesMap[areaTitle].add(row.ConferenceTitle);
            });

            const finalConferencesByArea = {};
            Object.keys(conferencesMap).forEach(areaTitle => {
              finalConferencesByArea[areaTitle] = Array.from(conferencesMap[areaTitle]);
            });

            setAreas(areasMap);
            setConferencesByArea(finalConferencesByArea);
            setConferences(loadedConferences);
            // Collect all conferences from CSV:
            const allConfNamesFromCSV = [];
            Object.values(conferencesMap).forEach(setOfConfs => { allConfNamesFromCSV.push(...Array.from(setOfConfs)); });
            setSelectedConferences(new Set(allConfNamesFromCSV));
            setFilteredConferences(loadedConferences);
            setLoading(false);
          },
        });
      } catch (error) {
        console.error("Error loading conferences:", error);
      }
    };
    fetchData();
  }, []);

  const filterConferences = () => {
    const selected = Array.from(selectedConferences);
    const updatedConferences = conferences.filter(conf => {
      const matchesConference = selected.includes(conf.name);
      const matchesSearch = conf.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesConference && matchesSearch;
    });

    const sortedConferences = updatedConferences.sort((a, b) => {
      const deadlineA = new Date(a.deadline);
      const deadlineB = new Date(b.deadline);
      const now = new Date();
      if (deadlineA > now && deadlineB > now) {
        return deadlineA - deadlineB;
      } else if (deadlineA <= now && deadlineB <= now) {
        return 0;
      } else if (deadlineA > now) {
        return -1;
      } else {
        return 1;
      }
    });

    setFilteredConferences(sortedConferences);
  };

  useEffect(() => {
    filterConferences();
    // eslint-disable-next-line
  }, [selectedConferences, searchQuery, conferences]);

  const handleCheckboxChange = (conferenceName) => {
    const updatedSelected = new Set(selectedConferences);
    if (updatedSelected.has(conferenceName)) {
      updatedSelected.delete(conferenceName);
    } else {
      updatedSelected.add(conferenceName);
    }
    setSelectedConferences(updatedSelected);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  return (
    <div>
      <header style={{ display: 'flex', alignItems: 'center', padding: '10px' }}>
        <img src={logo2} alt="dino" style={{ height: '100px', marginRight: '10px' }} />
        {/* <h1 style={{ margin: 0 }}>ROARS 🦖 Lab: CS Conference Deadlines 🚀🚀🚀</h1> */}
        <Typography
          variant="h4"
          component="h1"
          sx={{
            margin: 0,
            fontWeight: '900',
            letterSpacing: 2,
            background: 'rgb(23, 143, 51)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '1px 1px 4px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            userSelect: 'none',
            fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
            '@media (max-width:600px)': {
              fontSize: '1.8rem',
              letterSpacing: 1,
            },
          }}
        >
          ROARS 🦖 Lab: Deadlines 🚀🚀🚀
        </Typography>
      </header>
      <div className="App">
        {loading ? (
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <h2>Loading...</h2>
          </div>
        ) : (
          <>
            <div className="sidebar">
              <h2>Filters</h2>
              <TextField
                label="Search by conference name"
                variant="outlined"
                name="search"
                value={searchQuery}
                onChange={handleSearchChange}
                style={{ marginBottom: '20px', width: '100%', fontSize: '1.0rem' }}
                fullWidth
              />
              <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
                {Object.entries(areas).map(([parentArea, areaDetails], parentIndex) => {
                  const parentConfs = getConferencesByParentArea(parentArea);
                  const parentColor = parentAreaColors[parentIndex % parentAreaColors.length];
                  return (
                  <li key={parentArea} style={{ marginBottom: '8px', color: parentColor }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <Checkbox
                        indeterminate={isSomeSelected(parentConfs)}
                        checked={isAllSelected(parentConfs)}
                        onChange={(e) => toggleMultipleConferences(parentConfs, e.target.checked)}
                        color="primary"
                        size="small"
                        style={{ padding: 0, marginRight: 4 }}
                      />
                      <div
                        style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', flexGrow: 1 }}
                        onClick={() => toggleParent(parentArea)}
                      >
                        <IconButton size="small">
                          {openParents[parentArea] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                        <strong>{parentArea}</strong>
                      </div>
                    </div>
                    <Collapse in={openParents[parentArea]} timeout="auto" unmountOnExit>
                      <ul style={{ listStyle: 'none', paddingLeft: '24px' }}>
                        {areaDetails.map(({ area_title }) => {
                          const areaConfs = getConferencesByAreaTitle(area_title);
                          return (
                            <li key={area_title} style={{ marginBottom: '4px' }}>
                              <div style={{ display: 'flex', alignItems: 'center' }}>
                                <Checkbox
                                  indeterminate={isSomeSelected(areaConfs)}
                                  checked={isAllSelected(areaConfs)}
                                  onChange={(e) => toggleMultipleConferences(areaConfs, e.target.checked)}
                                  color="primary"
                                  size="small"
                                  style={{ padding: 0, marginRight: 4 }}
                                />
                                <div
                                  style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', flexGrow: 1 }}
                                  onClick={() => toggleArea(area_title)}
                                >
                                  <IconButton size="small">
                                    {openAreas[area_title] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                  </IconButton>
                                  <strong>{area_title}</strong>
                                </div>
                              </div>
                              <Collapse in={openAreas[area_title]} timeout="auto" unmountOnExit>
                                <ul style={{ listStyle: 'none', paddingLeft: '24px' }}>
                                  {conferencesByArea[area_title]?.map(conferenceName => (
                                    <li key={conferenceName}>
                                      <FormControlLabel
                                        control={
                                          <Checkbox
                                            checked={selectedConferences.has(conferenceName)}
                                            onChange={() => handleCheckboxChange(conferenceName)}
                                            color="primary"
                                            size="small"
                                          />
                                        }
                                        label={conferenceName}
                                      />
                                    </li>
                                  ))}
                                </ul>
                              </Collapse>
                            </li>
                          )
                        })}
                      </ul>
                    </Collapse>
                  </li>
                  )
                })}
              </ul>
            </div>
            <div className="conference-list">
              {filteredConferences.map(conf => (
                <ConferenceCard key={`${conf.name}-${conf.year}`} conference={conf} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;