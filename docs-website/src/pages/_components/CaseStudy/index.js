import React from "react";
import styles from "./case-study.module.scss";
import Link from '@docusaurus/Link'
import { Carousel } from "antd";
import caseStudyData from "./caseStudyContent";


const CaseStudy = () => {
  return (
    <div className={styles.container}>
      {/* Section-1 */}
      <div className={styles.case_study}>
        <div className={styles.case_study_heading}>
          <div>See how industry leaders use Datahub</div>
          <p>Across finance, healthcare, e-commerce, and countless more.</p>
        </div>

        <div className={styles.card_row}>
          <div className={styles.card_row_wrapper} >
            {caseStudyData.map((caseStudy) => (
              <div className={styles.card} key={caseStudy.link}>
                <a className={styles.cardLink} href={caseStudy.link} style={caseStudy.backgroundImage ? null : {
                  opacity: .5
                }}>
                  {caseStudy.tag ? <span className={styles.card_tag}>{caseStudy.tag}</span> : null}
                  <div className={styles.card_image} style={{ backgroundColor: caseStudy.backgroundImage ? null : '#eee' }}>
                    <img src={caseStudy.image} alt="" />
                    <div className={styles.cardImageBackground} style={{ backgroundImage: `url(${caseStudy.backgroundImage})` }} />
                  </div>
                  <div className={styles.card_heading_div}>
                    <div className={styles.card_heading}>
                      <span>{caseStudy.title}</span>
                    </div>
                    <div
                      className={styles.card_para}
                      dangerouslySetInnerHTML={{
                        __html: caseStudy.description,
                      }}
                    />
                  </div>
                </a>
              </div>
            ))}
          </div>
        </div>
        <Link className={styles.bottom_line} to="/adoption-stories">
          See all adoption stories →
        </Link>
      </div>
    </div>
  );
};

export default CaseStudy;