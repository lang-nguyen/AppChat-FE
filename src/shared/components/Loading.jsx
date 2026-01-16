import React from 'react';
import styles from './Loading.module.css';

const Loading = ({ text = "Đang xử lý..." }) => {
    return (
        <div className={styles.container}>
            <div className={styles.spinner}></div>
            <div className={styles.text}>{text}</div>
        </div>
    );
};

export default Loading;
