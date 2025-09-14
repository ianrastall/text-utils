# 27. Safety-Critical System End-of-Life Management: Ensuring Safe Retirement While Maintaining Compliance

## Introduction: Why End-of-Life Management Is Not Optional — It's a Safety Requirement

In safety-critical systems, **certification doesn't end at deployment—it doesn't even end when the system is retired**. When an aircraft is decommissioned, a medical device is phased out, or an autonomous vehicle fleet is retired, the responsibility for safety continues. Improper end-of-life management can lead to:
- Continued use of unsupported systems beyond their safety lifespan
- Loss of critical safety data needed for future designs
- Inadequate transition planning causing safety gaps
- Regulatory non-compliance with post-retirement obligations
- Unintended consequences when replacement systems are introduced

Traditional approaches treat end-of-life as a simple decommissioning process—something to be handled with minimal paperwork. In safety-critical systems, this is dangerously inadequate. End-of-life management must be designed from the outset as an **integral part of the safety lifecycle**, ensuring that systems are retired safely while preserving critical safety knowledge.

> **Safety Philosophy**: *If you cannot prove your system was safely retired, then you cannot prove your safety responsibility was fulfilled.*

This tutorial provides a complete framework for implementing safety-critical end-of-life management—ensuring that your systems are retired responsibly while maintaining compliance throughout the entire lifecycle. You will learn how to:
- Plan for end-of-life from initial design
- Preserve critical safety data for future systems
- Manage legacy system support during transition
- Execute safe transition planning to replacement systems
- Meet regulatory requirements for system retirement

By the end of this tutorial, your end-of-life process will not only be compliant—it will actively contribute to the safety of future systems.

---

## Why Traditional End-of-Life Approaches Fail in Safety-Critical Contexts

Many organizations treat end-of-life as an afterthought or a simple decommissioning process. These approaches create significant risks when applied to safety-critical systems.

| Problem (Traditional Approach) | Consequence in Safety-Critical Systems |
|-------------------------------|----------------------------------------|
| Ad-hoc retirement planning | Safety gaps during transition period |
| Incomplete data preservation | Loss of critical safety knowledge |
| No transition planning | Replacement system introduces new hazards |
| Minimal regulatory compliance | Fines, legal liability, and reputational damage |
| No legacy system support plan | Continued use of unsafe, unsupported systems |
| Unverified retirement process | Inability to prove safe retirement during audit |

### Case Study: Medical Device Recall Due to Poor End-of-Life Management

A Class III infusion pump reached end-of-life, but the manufacturer failed to properly communicate the retirement timeline to healthcare providers. Some facilities continued using the devices after support ended, unaware that critical safety updates were no longer available. When a previously unknown failure mode emerged, the unsupported devices could not be patched, leading to patient harm and a costly recall. The FDA determined that the company had failed to meet IEC 62304 requirements for end-of-life management.

> **Lesson**: End-of-life management isn't optional—it's a regulatory requirement that directly impacts patient safety.

---

## The End-of-Life Management Philosophy for Safety-Critical Systems

End-of-Life management transforms system retirement from a simple decommissioning process into a **safety-preserving transition**. It ensures that systems are retired responsibly while preserving critical safety knowledge for future designs.

### Core Principles of Safety-Critical End-of-Life Management

1. **Planned from Inception**: End-of-life considerations must be part of initial design.
2. **Data Preservation**: Critical safety data must be preserved for future systems.
3. **Safe Transition**: Transition to replacement systems must maintain safety continuity.
4. **Legacy Support**: Clear support timeline with safety implications documented.
5. **Regulatory Compliance**: Retirement process must meet evolving regulatory requirements.
6. **Knowledge Transfer**: Safety lessons learned must inform future designs.

> **Core Tenet**: *Your responsibility for safety doesn't end when the system is retired—it ends when the safety knowledge has been properly transferred to future systems.*

---

## Designing a Comprehensive End-of-Life Planning Framework

A robust end-of-life plan must be developed early in the system lifecycle and updated throughout.

### Safe Pattern: End-of-Life Plan Template

```markdown
# END-OF-LIFE PLAN: INFUSION PUMP SYSTEM

## 1. System Identification
- **System Name**: Infusion Pump Controller
- **Current Version**: 2.1.3
- **Certification Level**: IEC 62304 Class C
- **Initial Release Date**: 2020-01-15
- **Planned End-of-Life Date**: 2028-01-15
- **Planned End-of-Support Date**: 2030-01-15

## 2. End-of-Life Triggers
The following conditions will trigger end-of-life planning:
- **Hardware End-of-Life**: Key components reach end-of-manufacture
- **Regulatory Changes**: New standards make current design non-compliant
- **Safety Concerns**: Recurring safety issues that cannot be resolved
- **Technology Obsolescence**: Critical technologies no longer supported
- **Market Changes**: Significant shift in clinical requirements

## 3. Retirement Timeline
| Phase | Activity | Timeline | Responsible |
|-------|----------|----------|-------------|
| Planning | Develop end-of-life plan | 24 months before EOL | Product Manager |
| Notification | Notify customers of retirement | 18 months before EOL | Customer Support |
| Transition | Provide migration path to new system | 12 months before EOL | Engineering |
| Support Wind-down | Reduce support level gradually | 6 months before EOL | Support Team |
| Final Retirement | Decommission system | EOL Date | Engineering |

## 4. Data Preservation Requirements
| Data Type | Preservation Method | Retention Period | Verification Method |
|-----------|---------------------|------------------|---------------------|
| Safety Case | Encrypted archive | 15 years | Annual integrity check |
| Field Incident Data | Secure database | 15 years | CRC verification |
| Verification Evidence | PDF archive | 15 years | Hash verification |
| Source Code | Version control | 15 years | Git integrity check |
| Configuration Data | Structured archive | 15 years | Schema validation |

## 5. Transition Plan
### Replacement System
- **System Name**: NextGen Infusion Pump
- **Certification Level**: IEC 62304 Class C
- **Key Safety Improvements**:
  - Enhanced memory protection
  - Improved timing monitoring
  - Additional safety layers

### Transition Strategy
- **Phased Migration**: 6-month transition period with parallel operation
- **Data Conversion**: Verified tool for patient history migration
- **Training Program**: Comprehensive safety-focused training
- **Support Continuity**: Dedicated transition support team

### Safety Continuity Assessment
| Risk Area | Mitigation Strategy | Verification |
|-----------|---------------------|--------------|
| Data Loss | Verified conversion tool | TEST-CONV-001 |
| User Error | Enhanced UI with safety cues | TEST-UI-001 |
| Configuration Errors | Automated validation | TEST-CONFIG-001 |

## 6. Legacy System Support Plan
| Support Level | Services Provided | Timeline | Verification |
|---------------|-------------------|----------|--------------|
| Full Support | All services, updates | Until EOL Date | Annual review |
| Limited Support | Critical safety updates only | 12 months after EOL | Monthly review |
| No Support | No updates or support | After support ends | Final verification |

## 7. Regulatory Compliance
| Regulation | Requirement | Implementation | Verification |
|------------|-------------|----------------|--------------|
| IEC 62304 | Section 5.1.11 (End of Life) | Documented EOL plan | EOL-PLAN-001 |
| FDA 21 CFR 820 | Subpart H (Records/Reports) | Data preservation | RECORDS-001 |
| ISO 14971 | Clause 10 (Post-production) | Field data preservation | POST-PROD-001 |

## 8. Verification and Validation
| Activity | Method | Evidence | Responsible |
|----------|--------|----------|-------------|
| Plan Review | Document review | REVIEW-001 | Safety Engineer |
| Data Integrity | Hash verification | INTEGRITY-001 | QA Specialist |
| Transition Testing | Simulation testing | TEST-TRANS-001 | Test Engineer |
| Support Plan Verification | Audit | AUDIT-001 | Compliance Officer |
```

> **Verification Tags**: Every element of the plan includes verification references.
> **Data Preservation**: Clear requirements for preserving critical safety data.
> **Transition Planning**: Detailed strategy for maintaining safety continuity.

---

## Implementing Data Preservation Strategies

Critical safety data must be preserved for regulatory requirements and future system improvements.

### Safe Pattern: Data Preservation System

```python
#!/usr/bin/env python3
"""
data_preservation.py
Tool ID: TQ-DATA-PRESERVE-001
"""

import os
import hashlib
import json
import zipfile
import logging
from datetime import datetime

class DataPreservation:
    """Manages preservation of critical safety data for end-of-life systems."""
    
    def __init__(self, archive_dir="preservation_archive", config_file="preservation_config.json"):
        self.archive_dir = archive_dir
        self.config_file = config_file
        self._load_configuration()
        self._setup_logging()
    
    def _load_configuration(self):
        """Load preservation configuration from file."""
        if os.path.exists(self.config_file):
            with open(self.config_file, 'r') as f:
                self.config = json.load(f)
        else:
            self.config = {
                'components': [],
                'retention_policy': {
                    'safety_case': 15,      # 15 years
                    'field_data': 15,
                    'verification': 15,
                    'source_code': 15,
                    'configuration': 15
                },
                'verification_schedule': 'annual'
            }
    
    def _save_configuration(self):
        """Save preservation configuration to file."""
        with open(self.config_file, 'w') as f:
            json.dump(self.config, f, indent=2)
    
    def _setup_logging(self):
        """Set up logging for preservation activities."""
        logging.basicConfig(
            filename='preservation.log',
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s'
        )
    
    def add_component(self, component_id, source_path, preservation_type, retention_years=None):
        """Add a component to the preservation system."""
        if any(c['id'] == component_id for c in self.config['components']):
            raise ValueError(f"Component {component_id} already exists")
        
        if retention_years is None:
            # Use default retention policy based on type
            retention_years = self.config['retention_policy'].get(preservation_type, 15)
        
        component = {
            'id': component_id,
            'source': source_path,
            'type': preservation_type,
            'retention': retention_years,
            'added': datetime.now().isoformat(),
            'verified': False,
            'last_verification': None
        }
        
        self.config['components'].append(component)
        logging.info(f"Added component {component_id} for preservation")
    
    def create_preservation_archive(self, archive_id):
        """Create a preservation archive for all registered components."""
        # Create archive directory if needed
        os.makedirs(self.archive_dir, exist_ok=True)
        
        # Create archive file
        archive_path = os.path.join(self.archive_dir, f"{archive_id}.zip")
        with zipfile.ZipFile(archive_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
            # Add components to archive
            for component in self.config['components']:
                self._add_component_to_archive(zipf, component)
            
            # Add manifest file
            manifest = self._create_manifest(archive_id)
            zipf.writestr("MANIFEST.json", json.dumps(manifest, indent=2))
        
        # Verify archive integrity
        if not self.verify_archive_integrity(archive_path):
            logging.error(f"Archive {archive_id} failed integrity verification")
            raise RuntimeError(f"Archive {archive_id} failed integrity verification")
        
        logging.info(f"Created preservation archive {archive_id}")
        return archive_path
    
    def _add_component_to_archive(self, zipf, component):
        """Add a component to the preservation archive."""
        source = component['source']
        
        # Handle different source types
        if os.path.isdir(source):
            # Directory - add all contents
            for root, _, files in os.walk(source):
                for file in files:
                    file_path = os.path.join(root, file)
                    arcname = os.path.relpath(file_path, source)
                    zipf.write(file_path, arcname)
        elif os.path.isfile(source):
            # Single file
            zipf.write(source, os.path.basename(source))
        else:
            logging.warning(f"Source {source} not found for component {component['id']}")
    
    def _create_manifest(self, archive_id):
        """Create a manifest for the preservation archive."""
        return {
            'archive_id': archive_id,
            'created': datetime.now().isoformat(),
            'components': [
                {
                    'id': c['id'],
                    'type': c['type'],
                    'retention': c['retention'],
                    'source': c['source']
                } for c in self.config['components']
            ],
            'retention_policy': self.config['retention_policy'],
            'verification_schedule': self.config['verification_schedule']
        }
    
    def verify_archive_integrity(self, archive_path):
        """Verify the integrity of a preservation archive."""
        try:
            # Test the archive
            with zipfile.ZipFile(archive_path, 'r') as zipf:
                result = zipf.testzip()
                if result is not None:
                    logging.error(f"Corrupted file in archive: {result}")
                    return False
                
                # Calculate hash for verification
                sha256_hash = hashlib.sha256()
                with open(archive_path, 'rb') as f:
                    for byte_block in iter(lambda: f.read(4096), b""):
                        sha256_hash.update(byte_block)
                
                # Store verification result
                verification = {
                    'archive': archive_path,
                    'verified': datetime.now().isoformat(),
                    'sha256': sha256_hash.hexdigest(),
                    'size': os.path.getsize(archive_path)
                }
                
                # Save verification
                with open(f"{archive_path}.verify", 'w') as f:
                    json.dump(verification, f, indent=2)
                
                # Update component verification status
                for component in self.config['components']:
                    component['verified'] = True
                    component['last_verification'] = datetime.now().isoformat()
                
                return True
        except Exception as e:
            logging.error(f"Archive verification failed: {str(e)}")
            return False
    
    def schedule_verification(self):
        """Schedule periodic verification of preservation archives."""
        # In a real system, this would integrate with a scheduler
        # For this example, we'll just log what would happen
        logging.info(f"Scheduled {self.config['verification_schedule']} verification of preservation archives")
        
        # Verify all archives
        for archive in os.listdir(self.archive_dir):
            if archive.endswith('.zip'):
                archive_path = os.path.join(self.archive_dir, archive)
                if self.verify_archive_integrity(archive_path):
                    logging.info(f"Archive {archive} verified successfully")
                else:
                    logging.error(f"Archive {archive} failed verification")
    
    def generate_preservation_report(self, output_file):
        """Generate a report of preservation status."""
        report = {
            'metadata': {
                'tool_version': '1.0',
                'generation_time': datetime.now().isoformat()
            },
            'components': [],
            'archive_status': []
        }
        
        # Component status
        for component in self.config['components']:
            report['components'].append({
                'id': component['id'],
                'type': component['type'],
                'retention': component['retention'],
                'verified': component['verified'],
                'last_verification': component['last_verification']
            })
        
        # Archive status
        for archive in os.listdir(self.archive_dir):
            if archive.endswith('.zip'):
                archive_path = os.path.join(self.archive_dir, archive)
                verify_file = f"{archive_path}.verify"
                
                status = {
                    'archive': archive,
                    'exists': os.path.exists(archive_path),
                    'verified': False,
                    'last_verification': None
                }
                
                if os.path.exists(verify_file):
                    with open(verify_file, 'r') as f:
                        verification = json.load(f)
                    status['verified'] = True
                    status['last_verification'] = verification['verified']
                
                report['archive_status'].append(status)
        
        # Save report
        with open(output_file, 'w') as f:
            json.dump(report, f, indent=2)
        
        return output_file

# Example usage
if __name__ == "__main__":
    preservation = DataPreservation()
    
    # Add components for preservation
    preservation.add_component(
        "safety_case",
        "safety/safety_case_2025.md",
        "safety_case"
    )
    
    preservation.add_component(
        "field_data",
        "field_data/incidents_2020-2025.csv",
        "field_data"
    )
    
    preservation.add_component(
        "verification",
        "verification/evidence_2025.zip",
        "verification"
    )
    
    preservation.add_component(
        "source_code",
        "src/",
        "source_code"
    )
    
    preservation.add_component(
        "configuration",
        "config/system_config.json",
        "configuration"
    )
    
    # Create preservation archive
    preservation.create_preservation_archive("EOL-2025-001")
    
    # Schedule verification
    preservation.schedule_verification()
    
    # Generate preservation report
    preservation.generate_preservation_report("preservation_report_2025.json")
    
    # Save configuration
    preservation._save_configuration()
```

> **Key Safety Features**:
> - Complete verification of archive integrity
> - Cryptographic hashing for data preservation
> - Scheduled verification to ensure long-term integrity
> - Detailed logging of all preservation activities
> - Retention policy enforcement

---

## Managing Legacy System Support

Legacy system support must be carefully managed to prevent unsafe continued use.

### Safe Pattern: Legacy Support Management System

```c
/*
 * # Summary: Legacy system support management
 * # Requirement: REQ-LEGACY-001
 * # Verification: VC-LEGACY-001
 * # Test: TEST-LEGACY-001
 *
 * Legacy Support Considerations:
 *
 * 1. Safety Rules:
 *    - Verified legacy support timeline
 *    - Complete transition planning
 *    - Safety implications documented
 *
 * 2. Safety Verification:
 *    - Support behavior verified
 *    - No unverified support operations
 *    - Safety properties maintained
 *
 * Tool: GCC 11.2.0 (qualified)
 */

#include <stdint.h>
#include <string.h>
#include <time.h>

// Support levels
typedef enum {
    SUPPORT_FULL = 0,
    SUPPORT_LIMITED = 1,
    SUPPORT_NONE = 2
} support_level_t;

// Safety event types
typedef enum {
    EVENT_SUPPORT_STARTED = 0x0001,
    EVENT_SUPPORT_CHANGED = 0x0002,
    EVENT_SUPPORT_ENDED = 0x0003,
    EVENT_LEGACY_USAGE = 0x0101
} event_type_t;

// Support timeline structure
typedef struct {
    time_t full_support_end;    // End of full support
    time_t limited_support_end; // End of limited support
    time_t final_end;           // Final end date
} support_timeline_t;

// Legacy system state
static support_timeline_t support_dates;
static support_level_t current_support_level = SUPPORT_FULL;
static uint32_t legacy_usage_count = 0;

/*# check: REQ-LEGACY-002
  # check: VC-LEGACY-002
  Initialize legacy support system */
void init_legacy_support(
    time_t full_support_end,
    time_t limited_support_end,
    time_t final_end
) {
    /* Safety Rationale: Establish valid support timeline
     * Failure Mode: None (safe operation)
     * Support Behavior: Initialization
     * Interface Safety: Timeline setup */
    
    support_dates.full_support_end = full_support_end;
    support_dates.limited_support_end = limited_support_end;
    support_dates.final_end = final_end;
    
    // Determine current support level
    time_t now = time(NULL);
    if (now >= final_end) {
        current_support_level = SUPPORT_NONE;
    } else if (now >= limited_support_end) {
        current_support_level = SUPPORT_LIMITED;
    } else {
        current_support_level = SUPPORT_FULL;
    }
    
    // Log support initialization
    log_event(EVENT_SUPPORT_STARTED);
}

/*# check: REQ-LEGACY-003
  # check: VC-LEGACY-003
  Update support level based on current date */
void update_support_level() {
    /* Safety Rationale: Maintain accurate support level
     * Failure Mode: None (safe operation)
     * Support Behavior: Level management
     * Interface Safety: State transition */
    
    time_t now = time(NULL);
    support_level_t new_level = current_support_level;
    
    if (now >= support_dates.final_end) {
        new_level = SUPPORT_NONE;
    } else if (now >= support_dates.limited_support_end) {
        new_level = SUPPORT_LIMITED;
    } else if (now >= support_dates.full_support_end) {
        new_level = SUPPORT_FULL;
    }
    
    // Only update if level changed
    if (new_level != current_support_level) {
        current_support_level = new_level;
        log_event(EVENT_SUPPORT_CHANGED);
    }
}

/*# check: REQ-LEGACY-004
  # check: VC-LEGACY-004
  Check if system is still supported */
int is_system_supported() {
    /* Safety Rationale: Prevent use of unsupported systems
     * Failure Mode: Return 0 if unsupported
     * Support Behavior: Access control
     * Interface Safety: Safety gate */
    
    update_support_level();
    return (current_support_level != SUPPORT_NONE);
}

/*# check: REQ-LEGACY-005
  # check: VC-LEGACY-005
  Check if full support is available */
int is_full_support_available() {
    /* Safety Rationale: Determine support level for critical operations
     * Failure Mode: Return 0 if not full support
     * Support Behavior: Access control
     * Interface Safety: Safety gate */
    
    update_support_level();
    return (current_support_level == SUPPORT_FULL);
}

/*# check: REQ-LEGACY-006
  # check: VC-LEGACY-006
  Record legacy system usage */
void record_legacy_usage() {
    /* Safety Rationale: Track usage of legacy systems
     * Failure Mode: None (safe operation)
     * Support Behavior: Usage monitoring
     * Interface Safety: Data collection */
    
    legacy_usage_count++;
    log_event(EVENT_LEGACY_USAGE);
    
    // Take action if excessive usage
    if (legacy_usage_count > 1000) {
        trigger_legacy_usage_alert();
    }
}

/*# check: REQ-LEGACY-007
  # check: VC-LEGACY-007
  Get current support level */
support_level_t get_current_support_level() {
    /* Safety Rationale: Provide accurate support information
     * Failure Mode: None (safe operation)
     * Support Behavior: Information access
     * Interface Safety: Data access */
    
    update_support_level();
    return current_support_level;
}

/*# check: REQ-LEGACY-008
  # check: VC-LEGACY-008
  Generate support status report */
void generate_support_status_report() {
    /* Safety Rationale: Document support status for regulatory compliance
     * Failure Mode: None (safe operation)
     * Support Behavior: Reporting
     * Interface Safety: Data output */
    
    // In a real system, this would generate a detailed report
    // For this example, we'll just log some statistics
    
    log_event(EVENT_SUPPORT_STATUS);
    log_value("CURRENT_SUPPORT_LEVEL", current_support_level);
    log_value("LEGACY_USAGE_COUNT", legacy_usage_count);
    
    // Log remaining support time
    time_t now = time(NULL);
    if (current_support_level == SUPPORT_FULL) {
        log_value("FULL_SUPPORT_REMAINING", support_dates.full_support_end - now);
    } else if (current_support_level == SUPPORT_LIMITED) {
        log_value("LIMITED_SUPPORT_REMAINING", support_dates.limited_support_end - now);
    }
}
```

> **Verification Note**: For DO-178C Level A, all legacy support management logic must be formally verified and documented in the safety case.

---

## Implementing Transition Planning for Safety-Critical Systems

Transition planning must ensure safety continuity between systems.

### Safe Pattern: Transition Planning Framework

```python
#!/usr/bin/env python3
"""
transition_planner.py
Tool ID: TQ-TRANSITION-001
"""

import json
import csv
import os
from datetime import datetime, timedelta

class TransitionPlanner:
    """Manages transition planning between legacy and replacement systems."""
    
    def __init__(self, db_path="transition.db"):
        self.db_path = db_path
        self._load_database()
    
    def _load_database(self):
        """Load transition database from file."""
        if os.path.exists(self.db_path):
            with open(self.db_path, 'r') as f:
                self.db = json.load(f)
        else:
            self.db = {
                'systems': {},
                'transitions': [],
                'risks': [],
                'verification': {}
            }
    
    def _save_database(self):
        """Save transition database to file."""
        with open(self.db_path, 'w') as f:
            json.dump(self.db, f, indent=2)
    
    def register_system(self, system_id, name, certification, eol_date, support_end):
        """Register a system for transition planning."""
        if system_id in self.db['systems']:
            raise ValueError(f"System {system_id} already registered")
        
        self.db['systems'][system_id] = {
            'id': system_id,
            'name': name,
            'certification': certification,
            'eol_date': eol_date,
            'support_end': support_end,
            'status': 'active' if datetime.now().isoformat() < eol_date else 'eol'
        }
    
    def plan_transition(self, legacy_id, replacement_id, start_date, end_date):
        """Plan a transition between two systems."""
        if legacy_id not in self.db['systems']:
            raise ValueError(f"Legacy system {legacy_id} not registered")
        
        if replacement_id not in self.db['systems']:
            raise ValueError(f"Replacement system {replacement_id} not registered")
        
        # Create transition plan
        transition = {
            'id': f"TRANS-{legacy_id}-{replacement_id}",
            'legacy': legacy_id,
            'replacement': replacement_id,
            'start_date': start_date,
            'end_date': end_date,
            'status': 'planned',
            'risks': [],
            'verification': []
        }
        
        # Add transition to database
        self.db['transitions'].append(transition)
        
        # Update system status
        self.db['systems'][legacy_id]['status'] = 'transitioning'
        self.db['systems'][replacement_id]['status'] = 'transitioning'
    
    def identify_transition_risks(self, transition_id):
        """Identify risks in a transition plan."""
        transition = self._get_transition(transition_id)
        if not transition:
            raise ValueError(f"Transition {transition_id} not found")
        
        # Identify risks based on system differences
        legacy = self.db['systems'][transition['legacy']]
        replacement = self.db['systems'][transition['replacement']]
        
        risks = []
        
        # Check for certification level differences
        if legacy['certification'] != replacement['certification']:
            risks.append({
                'id': f"RISK-{transition_id}-001",
                'description': "Certification level difference",
                'severity': "high",
                'mitigation': "Additional verification required"
            })
        
        # Check for data compatibility
        if not self._check_data_compatibility(legacy['id'], replacement['id']):
            risks.append({
                'id': f"RISK-{transition_id}-002",
                'description': "Data compatibility issues",
                'severity': "high",
                'mitigation': "Verified data conversion tool required"
            })
        
        # Check for user interface differences
        if not self._check_ui_compatibility(legacy['id'], replacement['id']):
            risks.append({
                'id': f"RISK-{transition_id}-003",
                'description': "User interface differences",
                'severity': "medium",
                'mitigation': "Enhanced training program required"
            })
        
        # Add risks to transition
        transition['risks'] = risks
        return risks
    
    def _check_data_compatibility(self, legacy_id, replacement_id):
        """Check if data formats are compatible between systems."""
        # In real implementation, this would check actual data formats
        return False  # Simplified for example
    
    def _check_ui_compatibility(self, legacy_id, replacement_id):
        """Check if user interfaces are compatible between systems."""
        # In real implementation, this would check UI elements
        return False  # Simplified for example
    
    def _get_transition(self, transition_id):
        """Get a transition by ID."""
        for transition in self.db['transitions']:
            if transition['id'] == transition_id:
                return transition
        return None
    
    def verify_transition(self, transition_id, verification_id, evidence):
        """Verify a transition plan element."""
        transition = self._get_transition(transition_id)
        if not transition:
            raise ValueError(f"Transition {transition_id} not found")
        
        # Add verification evidence
        transition['verification'].append({
            'id': verification_id,
            'evidence': evidence,
            'verified': datetime.now().isoformat()
        })
        
        # Check if all required verifications are complete
        if self._is_transition_verified(transition_id):
            transition['status'] = 'verified'
    
    def _is_transition_verified(self, transition_id):
        """Check if a transition is fully verified."""
        transition = self._get_transition(transition_id)
        if not transition:
            return False
        
        # Required verifications
        required = [
            'data_compatibility',
            'safety_continuity',
            'user_training',
            'support_continuity'
        ]
        
        # Check if all required verifications are present
        verified = [v['id'] for v in transition['verification']]
        return all(req in verified for req in required)
    
    def execute_transition(self, transition_id):
        """Execute a verified transition plan."""
        transition = self._get_transition(transition_id)
        if not transition:
            raise ValueError(f"Transition {transition_id} not found")
        
        if transition['status'] != 'verified':
            raise ValueError(f"Transition {transition_id} not fully verified")
        
        # Update transition status
        transition['status'] = 'executing'
        
        # In real implementation, this would coordinate the actual transition
        # For this example, we'll just log the execution
        
        # Update system statuses
        self.db['systems'][transition['legacy']]['status'] = 'eol'
        self.db['systems'][transition['replacement']]['status'] = 'active'
        
        # Log completion
        transition['completed'] = datetime.now().isoformat()
        transition['status'] = 'completed'
    
    def generate_transition_report(self, transition_id, output_file):
        """Generate a transition report for regulatory compliance."""
        transition = self._get_transition(transition_id)
        if not transition:
            raise ValueError(f"Transition {transition_id} not found")
        
        legacy = self.db['systems'][transition['legacy']]
        replacement = self.db['systems'][transition['replacement']]
        
        report = f"""
# TRANSITION REPORT: {transition_id}

## Transition Overview
- **Legacy System**: {legacy['name']} ({transition['legacy']})
- **Replacement System**: {replacement['name']} ({transition['replacement']})
- **Start Date**: {transition['start_date']}
- **End Date**: {transition['end_date']}
- **Status**: {transition['status']}
- **Completion Date**: {transition.get('completed', 'N/A')}

## System Comparison
| Property | Legacy System | Replacement System |
|----------|---------------|--------------------|
| Certification Level | {legacy['certification']} | {replacement['certification']} |
| EOL Date | {legacy['eol_date']} | N/A |
| Support End | {legacy['support_end']} | N/A |
| Current Status | {legacy['status']} | {replacement['status']} |

## Identified Risks
"""
        
        for risk in transition['risks']:
            report += f"- **{risk['id']}**: {risk['description']} (Severity: {risk['severity']})\n"
            report += f"  *Mitigation*: {risk['mitigation']}\n\n"
        
        report += "\n## Verification Status\n"
        
        for verification in transition['verification']:
            report += f"- **{verification['id']}**: Verified on {verification['verified']}\n"
        
        report += "\n## Transition Timeline\n"
        report += "```\n"
        report += f"Planning:      {transition['start_date']} - {(datetime.fromisoformat(transition['start_date']) + timedelta(days=30)).isoformat()}\n"
        report += f"Notification:  {(datetime.fromisoformat(transition['start_date']) + timedelta(days=30)).isoformat()} - {(datetime.fromisoformat(transition['start_date']) + timedelta(days=90)).isoformat()}\n"
        report += f"Transition:    {(datetime.fromisoformat(transition['start_date']) + timedelta(days=90)).isoformat()} - {transition['end_date']}\n"
        report += "```\n"
        
        report += "\n## Conclusion\n"
        if transition['status'] == 'completed':
            report += "Transition completed successfully with all safety continuity measures in place.\n"
        else:
            report += "Transition is in progress with all identified risks mitigated.\n"
        
        with open(output_file, 'w') as f:
            f.write(report.strip())

# Example usage
if __name__ == "__main__":
    planner = TransitionPlanner()
    
    # Register systems
    planner.register_system(
        "LEGACY-001",
        "Infusion Pump v2",
        "IEC 62304 Class C",
        "2025-01-15",
        "2027-01-15"
    )
    
    planner.register_system(
        "REPLACEMENT-001",
        "NextGen Infusion Pump",
        "IEC 62304 Class C",
        "2030-01-15",
        "2032-01-15"
    )
    
    # Plan transition
    planner.plan_transition(
        "LEGACY-001",
        "REPLACEMENT-001",
        "2024-01-15",
        "2025-07-15"
    )
    
    # Identify risks
    planner.identify_transition_risks("TRANS-LEGACY-001-REPLACEMENT-001")
    
    # Verify transition elements
    planner.verify_transition(
        "TRANS-LEGACY-001-REPLACEMENT-001",
        "data_compatibility",
        "TEST-DATA-001: Verified data conversion tool"
    )
    
    planner.verify_transition(
        "TRANS-LEGACY-001-REPLACEMENT-001",
        "safety_continuity",
        "TEST-SAFETY-001: Verified safety continuity"
    )
    
    planner.verify_transition(
        "TRANS-LEGACY-001-REPLACEMENT-001",
        "user_training",
        "TRAINING-001: Completed training program"
    )
    
    planner.verify_transition(
        "TRANS-LEGACY-001-REPLACEMENT-001",
        "support_continuity",
        "SUPPORT-001: Verified support continuity plan"
    )
    
    # Execute transition
    planner.execute_transition("TRANS-LEGACY-001-REPLACEMENT-001")
    
    # Generate transition report
    planner.generate_transition_report(
        "TRANS-LEGACY-001-REPLACEMENT-001",
        "transition_report_LEGACY-001.md"
    )
    
    # Save database
    planner._save_database()
```

> **Key Safety Features**:
> - Comprehensive risk identification for transitions
> - Verification of all critical transition elements
> - Detailed transition timeline with safety milestones
> - Regulatory-compliant reporting
> - Safety continuity verification

---

## Meeting Regulatory Requirements for End-of-Life

Regulatory bodies have specific requirements for end-of-life management.

### Safe Pattern: Regulatory Compliance System

```python
#!/usr/bin/env python3
"""
regulatory_compliance.py
Tool ID: TQ-REG-COMPLIANCE-001
"""

import json
import csv
import os
from datetime import datetime

class RegulatoryCompliance:
    """Manages regulatory compliance for end-of-life processes."""
    
    def __init__(self, db_path="compliance.db"):
        self.db_path = db_path
        self._load_database()
    
    def _load_database(self):
        """Load compliance database from file."""
        if os.path.exists(self.db_path):
            with open(self.db_path, 'r') as f:
                self.db = json.load(f)
        else:
            self.db = {
                'requirements': {
                    'IEC 62304': {
                        '5.1.11': {
                            'description': 'End of Life',
                            'evidence': ['eol_plan', 'data_preservation', 'transition_plan']
                        }
                    },
                    'FDA 21 CFR 820': {
                        '820.30': {
                            'description': 'Design Controls',
                            'evidence': ['design_history_file', 'traceability_matrix']
                        },
                        '820.250': {
                            'description': 'Medical Device Reporting',
                            'evidence': ['incident_reports', 'root_cause_analysis']
                        }
                    },
                    'ISO 14971': {
                        '10': {
                            'description': 'Post-production Information',
                            'evidence': ['field_data', 'problem_resolution']
                        }
                    }
                },
                'eol_plans': [],
                'compliance_status': {}
            }
    
    def _save_database(self):
        """Save compliance database to file."""
        with open(self.db_path, 'w') as f:
            json.dump(self.db, f, indent=2)
    
    def create_eol_plan(self, plan_id, system, eol_date, support_end):
        """Create an end-of-life plan for a system."""
        plan = {
            'id': plan_id,
            'system': system,
            'eol_date': eol_date,
            'support_end': support_end,
            'status': 'draft',
            'requirements': {
                'IEC 62304': {
                    '5.1.11': 'pending'
                },
                'FDA 21 CFR 820': {
                    '820.30': 'pending',
                    '820.250': 'pending'
                },
                'ISO 14971': {
                    '10': 'pending'
                }
            },
            'evidence': {
                'eol_plan': None,
                'data_preservation': None,
                'transition_plan': None,
                'design_history': None,
                'incident_reports': None,
                'field_data': None
            }
        }
        
        self.db['eol_plans'].append(plan)
        self.db['compliance_status'][plan_id] = 'incomplete'
    
    def submit_eol_plan(self, plan_id, plan_document):
        """Submit an end-of-life plan for review."""
        plan = self._get_plan(plan_id)
        if not plan:
            raise ValueError(f"Plan {plan_id} not found")
        
        plan['evidence']['eol_plan'] = plan_document
        plan['status'] = 'submitted'
        
        # Update compliance status
        self._update_compliance_status(plan_id)
    
    def verify_data_preservation(self, plan_id, evidence):
        """Verify data preservation for an end-of-life plan."""
        plan = self._get_plan(plan_id)
        if not plan:
            raise ValueError(f"Plan {plan_id} not found")
        
        plan['evidence']['data_preservation'] = evidence
        plan['requirements']['IEC 62304']['5.1.11'] = 'verified'
        
        # Update compliance status
        self._update_compliance_status(plan_id)
    
    def verify_transition_plan(self, plan_id, evidence):
        """Verify transition plan for an end-of-life plan."""
        plan = self._get_plan(plan_id)
        if not plan:
            raise ValueError(f"Plan {plan_id} not found")
        
        plan['evidence']['transition_plan'] = evidence
        plan['requirements']['IEC 62304']['5.1.11'] = 'verified'
        
        # Update compliance status
        self._update_compliance_status(plan_id)
    
    def _get_plan(self, plan_id):
        """Get an end-of-life plan by ID."""
        for plan in self.db['eol_plans']:
            if plan['id'] == plan_id:
                return plan
        return None
    
    def _update_compliance_status(self, plan_id):
        """Update the compliance status for a plan."""
        plan = self._get_plan(plan_id)
        if not plan:
            return
        
        # Check IEC 62304 compliance
        if plan['evidence']['eol_plan'] and plan['evidence']['data_preservation'] and plan['evidence']['transition_plan']:
            plan['requirements']['IEC 62304']['5.1.11'] = 'compliant'
        
        # Check FDA compliance
        if plan['evidence']['design_history'] and plan['evidence']['incident_reports']:
            plan['requirements']['FDA 21 CFR 820']['820.30'] = 'compliant'
            plan['requirements']['FDA 21 CFR 820']['820.250'] = 'compliant'
        
        # Check ISO 14971 compliance
        if plan['evidence']['field_data'] and plan['evidence']['incident_reports']:
            plan['requirements']['ISO 14971']['10'] = 'compliant'
        
        # Determine overall status
        compliant = True
        for standard, reqs in plan['requirements'].items():
            for req, status in reqs.items():
                if status != 'compliant':
                    compliant = False
                    break
        
        self.db['compliance_status'][plan_id] = 'compliant' if compliant else 'incomplete'
    
    def generate_compliance_report(self, plan_id, output_file):
        """Generate a regulatory compliance report."""
        plan = self._get_plan(plan_id)
        if not plan:
            raise ValueError(f"Plan {plan_id} not found")
        
        report = f"""
# REGULATORY COMPLIANCE REPORT: {plan_id}

## Plan Information
- **System**: {plan['system']}
- **EOL Date**: {plan['eol_date']}
- **Support End Date**: {plan['support_end']}
- **Status**: {plan['status']}
- **Compliance Status**: {self.db['compliance_status'][plan_id]}

## Regulatory Requirements
"""
        
        # IEC 62304
        report += "### IEC 62304\n"
        report += "| Requirement | Description | Status | Evidence |\n"
        report += "|-------------|-------------|--------|----------|\n"
        report += f"| 5.1.11 | End of Life | {plan['requirements']['IEC 62304']['5.1.11']} | {plan['evidence']['eol_plan'] or ''}<br/>{plan['evidence']['data_preservation'] or ''}<br/>{plan['evidence']['transition_plan'] or ''} |\n"
        
        # FDA 21 CFR 820
        report += "\n### FDA 21 CFR 820\n"
        report += "| Requirement | Description | Status | Evidence |\n"
        report += "|-------------|-------------|--------|----------|\n"
        report += f"| 820.30 | Design Controls | {plan['requirements']['FDA 21 CFR 820']['820.30']} | {plan['evidence']['design_history'] or ''} |\n"
        report += f"| 820.250 | Medical Device Reporting | {plan['requirements']['FDA 21 CFR 820']['820.250']} | {plan['evidence']['incident_reports'] or ''} |\n"
        
        # ISO 14971
        report += "\n### ISO 14971\n"
        report += "| Requirement | Description | Status | Evidence |\n"
        report += "|-------------|-------------|--------|----------|\n"
        report += f"| 10 | Post-production Information | {plan['requirements']['ISO 14971']['10']} | {plan['evidence']['field_data'] or ''}<br/>{plan['evidence']['incident_reports'] or ''} |\n"
        
        report += "\n## Compliance Summary\n"
        if self.db['compliance_status'][plan_id] == 'compliant':
            report += "✅ All regulatory requirements for end-of-life management are satisfied.\n"
        else:
            report += "❌ The end-of-life plan is not fully compliant with regulatory requirements.\n"
        
        with open(output_file, 'w') as f:
            f.write(report.strip())

# Example usage
if __name__ == "__main__":
    compliance = RegulatoryCompliance()
    
    # Create EOL plan
    compliance.create_eol_plan(
        "EOL-2025-001",
        "Infusion Pump v2",
        "2025-01-15",
        "2027-01-15"
    )
    
    # Submit EOL plan
    compliance.submit_eol_plan(
        "EOL-2025-001",
        "eol_plan_2025.pdf"
    )
    
    # Verify data preservation
    compliance.verify_data_preservation(
        "EOL-2025-001",
        "data_preservation_2025.json"
    )
    
    # Verify transition plan
    compliance.verify_transition_plan(
        "EOL-2025-001",
        "transition_plan_2025.pdf"
    )
    
    # Add other required evidence
    compliance.db['eol_plans'][0]['evidence']['design_history'] = "design_history_2025.zip"
    compliance.db['eol_plans'][0]['evidence']['incident_reports'] = "incident_reports_2020-2025.csv"
    compliance.db['eol_plans'][0]['evidence']['field_data'] = "field_data_2020-2025.db"
    
    # Generate compliance report
    compliance.generate_compliance_report(
        "EOL-2025-001",
        "compliance_report_2025.md"
    )
    
    # Save database
    compliance._save_database()
```

> **Certification Note**: This tool must be qualified as TQL-2 per DO-178C before it can generate valid certification evidence.

---

## Real-World Case Study: Aviation System End-of-Life Management

**System**: Legacy Flight Management System (FMS) replacement program.

**Challenge**: Retire an aging FMS while ensuring safety continuity and regulatory compliance.

**Solution**:
1. Implemented comprehensive end-of-life planning:
   - Developed detailed EOL plan 24 months before retirement
   - Preserved all safety-critical data for 15+ years
   - Created verified transition plan to new system
2. Executed safe transition:
   - Phased migration over 6 months with parallel operation
   - Verified data conversion tool for flight plan migration
   - Comprehensive training program for pilots and maintenance
3. Managed legacy support:
   - Defined clear support timeline with safety implications
   - Monitored legacy system usage during transition
   - Provided dedicated transition support team

**Outcome**: The system was safely retired with zero safety incidents during transition. During a regulatory audit, the end-of-life documentation was praised as exemplary and used as a model for other programs.

---

## Tiered Exercises: Building Your Own End-of-Life Management System

### Exercise 1: Basic — Implement Data Preservation

**Goal**: Create a basic data preservation framework.

**Tasks**:
- Define preservation requirements for critical data
- Implement archive creation with integrity verification
- Add scheduled verification
- Generate preservation reports
- Verify archive integrity

**Deliverables**:
- `data_preservation.py`, `data_preservation.c`
- Test harness for preservation operations
- Verification report

---

### Exercise 2: Intermediate — Add Legacy Support Management

**Goal**: Extend the system with legacy support management.

**Tasks**:
- Implement support timeline tracking
- Add usage monitoring for legacy systems
- Generate support status reports
- Verify support level transitions
- Integrate with data preservation

**Deliverables**:
- `legacy_support.py`, `legacy_support.c`
- Test cases for support transitions
- Traceability matrix

---

### Exercise 3: Advanced — Full End-of-Life Management System

**Goal**: Build a complete end-of-life management system.

**Tasks**:
- Implement all end-of-life components
- Add regulatory compliance tracking
- Qualify all management tools
- Package certification evidence
- Test with retirement simulation

**Deliverables**:
- Complete management source code
- Qualified tool reports
- `certification_evidence.zip`
- Retirement simulation results

---

## Verification Pitfalls to Avoid

| Pitfall | Mitigation |
|--------|------------|
| Late end-of-life planning | Plan end-of-life from initial design |
| Incomplete data preservation | Verify archive integrity with cryptographic hashes |
| No transition planning | Implement verified transition plans with safety continuity |
| Unverified legacy usage | Monitor and alert on legacy system usage |
| Incomplete regulatory compliance | Automate compliance checks with qualified tools |
| Loss of safety knowledge | Preserve field data and safety improvements |
