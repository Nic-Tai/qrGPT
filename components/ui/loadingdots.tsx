import styles from './loading-dots.module.css';

interface LoadingDotsProps {
  color?: string;
  style?: string;
}

const LoadingDots = ({ color = '#000', style = 'small' }: LoadingDotsProps) => {
  return (
    <span className={style === 'small' ? styles.loading2 : styles.loading}>
      <span style={{ backgroundColor: color }} />
      <span style={{ backgroundColor: color }} />
      <span style={{ backgroundColor: color }} />
    </span>
  );
};

export default LoadingDots;
